------------------------------------------------------------------------------
-- THERAPIST MODULE MIGRATION
-- Run this whole file in the Supabase SQL Editor (Dashboard > SQL Editor).
-- It is idempotent: safe to run more than once.
--
-- What it adds:
--   0. Prerequisite visit tables if missing: `requests`, `therapist_notifications`
--   1. New enums for therapist account status, document types, visit status
--   2. Extra profile columns on `therapists` (specialty, bio, status, ...)
--   3. Fix `therapist_locations` so a therapist can cover MANY areas
--   4. `therapist_documents`            - uploaded verification documents
--   5. `therapist_weekly_availability`  - recurring weekly schedule (slots)
--   6. `therapist_schedule_overrides`   - specific dates ON/OFF
--   7. `requests` extra columns         - complaint / pain areas (body map)
--   8. `visits`                         - accepted requests waiting to be done
--   9. Storage bucket + policies for therapist documents
------------------------------------------------------------------------------

------------------------------------------------------------------------------
-- 0. PREREQUISITES (visits domain tables that may not exist yet)
--    These come from aid-x-bait-db/visits/Tables but were never applied to
--    this Supabase project. Created here without the original single-column
--    UNIQUE constraints (which would have limited a patient/location to one
--    request EVER) and with a composite unique on therapist_notifications.
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests
(
    id            SERIAL PRIMARY KEY,
    patient_id    INTEGER      NOT NULL REFERENCES patients (id),
    location_id   INTEGER      NOT NULL REFERENCES locations (id),
    request_date  DATE         NOT NULL,
    time_slot     VARCHAR(255) NOT NULL CHECK (time_slot IN ('8:00-12:00', '12:00-16:00', '16:00-20:00')),
    gender        VARCHAR(255) NOT NULL CHECK (gender IN ('Male', 'Female')),
    status        VARCHAR(255) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    queue         VARCHAR(255) NOT NULL DEFAULT 'Pending Requests' CHECK (queue IN ('Pending Requests', 'Review Queue')),
    attached_docs JSONB,
    notes         TEXT,
    is_archived   BOOLEAN                  DEFAULT FALSE,
    is_reviewed   BOOLEAN                  DEFAULT FALSE,
    reviewed_at   TIMESTAMPTZ,
    reviewed_by   INTEGER REFERENCES admins (id),
    is_accepted   BOOLEAN                  DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_patient_id  ON requests (patient_id);
CREATE INDEX IF NOT EXISTS idx_requests_location_id ON requests (location_id);
CREATE INDEX IF NOT EXISTS idx_requests_reviewed_by ON requests (reviewed_by);

-- If the table pre-existed with the old single-column UNIQUEs, remove them.
ALTER TABLE requests
    DROP CONSTRAINT IF EXISTS requests_patient_id_key,
    DROP CONSTRAINT IF EXISTS requests_location_id_key;

CREATE TABLE IF NOT EXISTS therapist_notifications
(
    id           SERIAL PRIMARY KEY,
    request_id   INTEGER      NOT NULL REFERENCES requests (id),
    therapist_id INTEGER      NOT NULL REFERENCES therapists (id),
    status       VARCHAR(255) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    responded_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (request_id, therapist_id)
);

-- If the table pre-existed with the old single-column UNIQUEs, replace them
-- with the composite unique the API relies on for accept/decline upserts.
DO $$
BEGIN
    ALTER TABLE therapist_notifications
        DROP CONSTRAINT IF EXISTS therapist_notifications_request_id_key,
        DROP CONSTRAINT IF EXISTS therapist_notifications_therapist_id_key;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'therapist_notifications_request_id_therapist_id_key'
    ) THEN
        ALTER TABLE therapist_notifications
            ADD CONSTRAINT therapist_notifications_request_id_therapist_id_key
            UNIQUE (request_id, therapist_id);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_therapist_notifications_request_id   ON therapist_notifications (request_id);
CREATE INDEX IF NOT EXISTS idx_therapist_notifications_therapist_id ON therapist_notifications (therapist_id);

------------------------------------------------------------------------------
-- 1. ENUMS
------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'therapist_account_statuses') THEN
        CREATE TYPE therapist_account_statuses AS ENUM
            ('pending_documents', 'pending_review', 'approved', 'rejected', 'suspended');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'therapist_document_types') THEN
        CREATE TYPE therapist_document_types AS ENUM
            ('national_id', 'practice_license', 'degree_certificate', 'syndicate_card', 'cv', 'other');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'therapist_document_statuses') THEN
        CREATE TYPE therapist_document_statuses AS ENUM
            ('pending', 'approved', 'rejected');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_statuses') THEN
        CREATE TYPE visit_statuses AS ENUM
            ('scheduled', 'in_progress', 'done', 'cancelled');
    END IF;
END
$$;

------------------------------------------------------------------------------
-- 2. EXTEND `therapists` PROFILE
--    name + mobile live on `users`; this adds the professional profile.
------------------------------------------------------------------------------
ALTER TABLE therapists
    ADD COLUMN IF NOT EXISTS specialty        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bio              TEXT,
    ADD COLUMN IF NOT EXISTS gender           gender_types DEFAULT 'Unknown',
    ADD COLUMN IF NOT EXISTS experience_years INTEGER CHECK (experience_years >= 0),
    ADD COLUMN IF NOT EXISTS account_status   therapist_account_statuses NOT NULL DEFAULT 'pending_documents',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by      INTEGER REFERENCES admins (id),
    ADD COLUMN IF NOT EXISTS reviewed_at      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_available     BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_therapists_account_status ON therapists (account_status);
CREATE INDEX IF NOT EXISTS idx_therapists_specialty      ON therapists (specialty);

------------------------------------------------------------------------------
-- 3. FIX `therapist_locations` (areas covered)
--    Old schema had UNIQUE on therapist_id and location_id separately,
--    which only allowed ONE area per therapist. Allow many-to-many.
------------------------------------------------------------------------------
ALTER TABLE therapist_locations
    DROP CONSTRAINT IF EXISTS therapist_locations_therapist_id_key,
    DROP CONSTRAINT IF EXISTS therapist_locations_location_id_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'therapist_locations_therapist_location_uq'
    ) THEN
        ALTER TABLE therapist_locations
            ADD CONSTRAINT therapist_locations_therapist_location_uq
            UNIQUE (therapist_id, location_id);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_therapist_locations_location ON therapist_locations (location_id);

------------------------------------------------------------------------------
-- 4. `therapist_documents`
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS therapist_documents
(
    id            SERIAL PRIMARY KEY,
    therapist_id  INTEGER NOT NULL REFERENCES therapists (id) ON DELETE CASCADE,
    document_type therapist_document_types NOT NULL DEFAULT 'other',
    file_url      TEXT NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    mime_type     VARCHAR(100),
    size_kb       INTEGER,
    status        therapist_document_statuses NOT NULL DEFAULT 'pending',
    review_notes  TEXT,
    reviewed_by   INTEGER REFERENCES admins (id),
    reviewed_at   TIMESTAMPTZ,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_therapist_documents_therapist ON therapist_documents (therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_documents_status    ON therapist_documents (status);

------------------------------------------------------------------------------
-- 5. `therapist_weekly_availability`
--    Recurring schedule: which time slots the therapist works on each weekday.
--    day_of_week: 0 = Sunday ... 6 = Saturday
--    time_slot uses the same slots as `requests`.
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS therapist_weekly_availability
(
    id           SERIAL PRIMARY KEY,
    therapist_id INTEGER NOT NULL REFERENCES therapists (id) ON DELETE CASCADE,
    day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    time_slot    VARCHAR(255) NOT NULL
                 CHECK (time_slot IN ('8:00-12:00', '12:00-16:00', '16:00-20:00')),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (therapist_id, day_of_week, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_weekly_availability_therapist
    ON therapist_weekly_availability (therapist_id);

------------------------------------------------------------------------------
-- 6. `therapist_schedule_overrides`
--    Specific calendar dates where the therapist is unavailable (vacation)
--    or available outside the weekly pattern. time_slot NULL = whole day.
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS therapist_schedule_overrides
(
    id            SERIAL PRIMARY KEY,
    therapist_id  INTEGER NOT NULL REFERENCES therapists (id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    time_slot     VARCHAR(255)
                  CHECK (time_slot IS NULL OR time_slot IN ('8:00-12:00', '12:00-16:00', '16:00-20:00')),
    is_available  BOOLEAN NOT NULL DEFAULT FALSE,
    reason        TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE NULLS NOT DISTINCT (therapist_id, override_date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_schedule_overrides_therapist_date
    ON therapist_schedule_overrides (therapist_id, override_date);

------------------------------------------------------------------------------
-- 7. EXTEND `requests` with complaint details for the patient card
------------------------------------------------------------------------------
ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS complaint  TEXT,
    ADD COLUMN IF NOT EXISTS pain_areas JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN requests.complaint  IS 'Disease / chief complaint described by the patient';
COMMENT ON COLUMN requests.pain_areas IS 'Body-map pain locations, e.g. [{"area":"lower_back","side":"left","level":7}]';

------------------------------------------------------------------------------
-- 8. `visits`
--    Created when a therapist ACCEPTS a request. Tracks the visit until done.
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visits
(
    id              SERIAL PRIMARY KEY,
    request_id      INTEGER NOT NULL UNIQUE REFERENCES requests (id),
    therapist_id    INTEGER NOT NULL REFERENCES therapists (id),
    patient_id      INTEGER NOT NULL REFERENCES patients (id),
    scheduled_date  DATE NOT NULL,
    time_slot       VARCHAR(255) NOT NULL
                    CHECK (time_slot IN ('8:00-12:00', '12:00-16:00', '16:00-20:00')),
    status          visit_statuses NOT NULL DEFAULT 'scheduled',
    therapist_notes TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    cancel_reason   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_therapist_status ON visits (therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_visits_patient          ON visits (patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date   ON visits (scheduled_date);

------------------------------------------------------------------------------
-- 9. STORAGE BUCKET for therapist documents
--    Private bucket; the backend (service role) generates signed URLs.
------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('therapist-documents', 'therapist-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users may upload into their own folder: <auth_uid>/<file>
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'therapist_documents_insert_own'
    ) THEN
        CREATE POLICY therapist_documents_insert_own
            ON storage.objects FOR INSERT TO authenticated
            WITH CHECK (
                bucket_id = 'therapist-documents'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'therapist_documents_read_own'
    ) THEN
        CREATE POLICY therapist_documents_read_own
            ON storage.objects FOR SELECT TO authenticated
            USING (
                bucket_id = 'therapist-documents'
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END
$$;

------------------------------------------------------------------------------
-- DONE. The existing event trigger `on_create_table_add_updated_at`
-- automatically attaches updated_at triggers to the new tables.
------------------------------------------------------------------------------
