------------------------------------------------------------------------------
-- ============================================================================
-- DOCTOORY — PRODUCTION DATABASE SETUP (ALL-IN-ONE)
-- ============================================================================
--
-- Run this WHOLE file ONCE in the PRODUCTION Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste everything -> Run
--
-- It brings production up to date with development. It is IDEMPOTENT:
-- safe to run again later — existing objects are skipped, not recreated.
--
-- Contents, in dependency order:
--   0. Core prerequisites if missing (locations, admins, therapists,
--      therapist_locations)
--   1. Therapist module (001)
--   2. Directed requests (005): requests.preferred_therapist_id
--   3. In-app notifications (006): table + triggers
--   4. Specialties (007): specialties table + therapists/requests.specialty_id
--   5. Visit reviews (008): visit_reviews + therapist rating aggregate + triggers
--   6. Service-area seed (003): 27 Egyptian governorates
--   7. Admin utility (004): delete_user_completely()
--   8. Security (002): enable RLS on ALL public tables (runs LAST)
--
-- AFTER RUNNING, also check in the production project:
--   * Authentication -> Policies -> minimum password length = 8
--   * The website deployment has SUPABASE_SERVICE_ROLE_KEY of THIS project
------------------------------------------------------------------------------

------------------------------------------------------------------------------
-- 0. CORE PREREQUISITES (skipped if they already exist)
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations
(
    id              SERIAL PRIMARY KEY,
    location_name   VARCHAR(255)     NOT NULL UNIQUE,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    latitude_delta  DOUBLE PRECISION NOT NULL,
    longitude_delta DOUBLE PRECISION NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins
(
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL UNIQUE REFERENCES users (id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS therapists
(
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL UNIQUE REFERENCES users (id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS therapist_locations
(
    id           SERIAL PRIMARY KEY,
    therapist_id INTEGER NOT NULL REFERENCES therapists (id),
    location_id  INTEGER NOT NULL REFERENCES locations (id),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- FROM: 001_therapist_module.sql
-- ============================================================================
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

-- ============================================================================
-- FROM: 005_preferred_therapist.sql
-- ============================================================================
------------------------------------------------------------------------------
-- DIRECTED HOME-VISIT REQUESTS
-- Run in the Supabase SQL Editor. Idempotent.
--
-- Lets a patient send a request to ONE specific therapist instead of all
-- therapists in the area:
--   preferred_therapist_id = NULL  -> general request (any therapist in area)
--   preferred_therapist_id = X     -> only therapist X sees and can accept it
------------------------------------------------------------------------------

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS preferred_therapist_id INTEGER REFERENCES therapists (id);

CREATE INDEX IF NOT EXISTS idx_requests_preferred_therapist
    ON requests (preferred_therapist_id);

COMMENT ON COLUMN requests.preferred_therapist_id IS
    'NULL = general request visible to all area therapists; set = directed to one therapist';

-- ============================================================================
-- FROM: 006_notifications.sql
-- ============================================================================
------------------------------------------------------------------------------
-- IN-APP NOTIFICATIONS (therapist app + patient app)
-- Run in the Supabase SQL Editor. Idempotent.
--
-- A `notifications` table + triggers that write rows automatically:
--   new request           -> all area therapists (or only the chosen doctor)
--   therapist accepts     -> patient ("Dr X will visit you ...")
--   visit started         -> patient ("Your doctor has started the visit")
--   visit done            -> patient ("Visit completed")
--   visit cancelled       -> the other party
--
-- Titles/bodies are stored in BOTH English and Arabic; the apps pick by locale.
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications
(
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type           VARCHAR(50) NOT NULL,
    title          TEXT NOT NULL,
    title_ar       TEXT NOT NULL,
    body           TEXT NOT NULL,
    body_ar        TEXT NOT NULL,
    reference_type VARCHAR(20),
    reference_id   INTEGER,
    is_read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------------------------
-- 1. New request -> notify therapists
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_therapists_new_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT NEW.is_accepted THEN
        RETURN NEW;
    END IF;

    IF NEW.preferred_therapist_id IS NOT NULL THEN
        -- Directed: only the chosen doctor
        INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
        SELECT t.user_id,
               'new_request',
               'A patient requested you',
               'مريض طلبك تحديدًا',
               'A patient chose you for a home visit on ' || NEW.request_date || ' (' || NEW.time_slot || '). Open Requests to respond.',
               'اختارك مريض لزيارة منزلية يوم ' || NEW.request_date || ' (' || NEW.time_slot || '). افتح الطلبات للرد.',
               'request', NEW.id
        FROM therapists t
        WHERE t.id = NEW.preferred_therapist_id;
    ELSE
        -- General: every approved therapist covering the area
        INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
        SELECT t.user_id,
               'new_request',
               'New home-visit request',
               'طلب زيارة منزلية جديد',
               'A new request in ' || COALESCE(l.location_name, 'your area') || ' on ' || NEW.request_date || ' (' || NEW.time_slot || '). Open Requests to respond.',
               'طلب جديد في ' || COALESCE(l.location_name, 'منطقتك') || ' يوم ' || NEW.request_date || ' (' || NEW.time_slot || '). افتح الطلبات للرد.',
               'request', NEW.id
        FROM therapist_locations tl
        JOIN therapists t ON t.id = tl.therapist_id
        LEFT JOIN locations l ON l.id = NEW.location_id
        WHERE tl.location_id = NEW.location_id
          AND t.account_status = 'approved'
          AND t.is_available;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_therapists_new_request ON requests;
CREATE TRIGGER trg_notify_therapists_new_request
    AFTER INSERT ON requests
    FOR EACH ROW EXECUTE FUNCTION notify_therapists_new_request();

------------------------------------------------------------------------------
-- 2. Therapist accepts (visit created) -> notify patient
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_patient_visit_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_doctor TEXT;
BEGIN
    SELECT COALESCE(u.first_name || ' ' || u.last_name, 'Your therapist')
    INTO v_doctor
    FROM therapists t JOIN users u ON u.id = t.user_id
    WHERE t.id = NEW.therapist_id;

    INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
    SELECT p.user_id,
           'visit_scheduled',
           'Request accepted',
           'تم قبول طلبك',
           'Dr. ' || v_doctor || ' will visit you on ' || NEW.scheduled_date || ' (' || NEW.time_slot || ').',
           'د. ' || v_doctor || ' سيزورك يوم ' || NEW.scheduled_date || ' (' || NEW.time_slot || ').',
           'visit', NEW.id
    FROM patients p
    WHERE p.id = NEW.patient_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_patient_visit_created ON visits;
CREATE TRIGGER trg_notify_patient_visit_created
    AFTER INSERT ON visits
    FOR EACH ROW EXECUTE FUNCTION notify_patient_visit_created();

------------------------------------------------------------------------------
-- 3. Visit status changes -> notify the right party
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_visit_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_doctor TEXT;
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(u.first_name || ' ' || u.last_name, 'Your therapist')
    INTO v_doctor
    FROM therapists t JOIN users u ON u.id = t.user_id
    WHERE t.id = NEW.therapist_id;

    IF NEW.status = 'in_progress' THEN
        -- Doctor is attending the patient at home
        INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
        SELECT p.user_id, 'visit_started',
               'Your visit has started',
               'بدأت زيارتك',
               'Dr. ' || v_doctor || ' is attending your home visit now.',
               'د. ' || v_doctor || ' يقوم بزيارتك المنزلية الآن.',
               'visit', NEW.id
        FROM patients p WHERE p.id = NEW.patient_id;

    ELSIF NEW.status = 'done' THEN
        INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
        SELECT p.user_id, 'visit_done',
               'Visit completed',
               'اكتملت الزيارة',
               'Dr. ' || v_doctor || ' marked your home visit as completed. Get well soon!',
               'أنهى د. ' || v_doctor || ' زيارتك المنزلية. نتمنى لك الشفاء العاجل!',
               'visit', NEW.id
        FROM patients p WHERE p.id = NEW.patient_id;

    ELSIF NEW.status = 'cancelled' THEN
        IF COALESCE(NEW.cancel_reason, '') = 'Cancelled by patient' THEN
            -- tell the therapist
            INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
            SELECT t.user_id, 'visit_cancelled',
                   'Visit cancelled',
                   'تم إلغاء الزيارة',
                   'The patient cancelled the home visit scheduled for ' || NEW.scheduled_date || ' (' || NEW.time_slot || ').',
                   'ألغى المريض الزيارة المنزلية المقررة يوم ' || NEW.scheduled_date || ' (' || NEW.time_slot || ').',
                   'visit', NEW.id
            FROM therapists t WHERE t.id = NEW.therapist_id;
        ELSE
            -- tell the patient
            INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
            SELECT p.user_id, 'visit_cancelled',
                   'Visit cancelled',
                   'تم إلغاء الزيارة',
                   'Your home visit on ' || NEW.scheduled_date || ' (' || NEW.time_slot || ') was cancelled.' ||
                       CASE WHEN NEW.cancel_reason IS NOT NULL THEN ' Reason: ' || NEW.cancel_reason ELSE '' END,
                   'تم إلغاء زيارتك المنزلية يوم ' || NEW.scheduled_date || ' (' || NEW.time_slot || ').' ||
                       CASE WHEN NEW.cancel_reason IS NOT NULL THEN ' السبب: ' || NEW.cancel_reason ELSE '' END,
                   'visit', NEW.id
            FROM patients p WHERE p.id = NEW.patient_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_visit_status_change ON visits;
CREATE TRIGGER trg_notify_on_visit_status_change
    AFTER UPDATE OF status ON visits
    FOR EACH ROW EXECUTE FUNCTION notify_on_visit_status_change();

------------------------------------------------------------------------------
-- DONE. Verify after running:
--   INSERT a test request -> SELECT * FROM notifications ORDER BY id DESC;
------------------------------------------------------------------------------

-- ============================================================================
-- FROM: 007_specialties.sql
-- ============================================================================
------------------------------------------------------------------------------
-- SPECIALTIES (admin-managed list)
-- Run in the Supabase SQL Editor. Idempotent.
--
-- Turns the free-text therapist `specialty` into a managed catalogue:
--   * specialties              - the list admins control from the dashboard
--   * therapists.specialty_id  - which specialty a therapist has (one each)
--   * requests.specialty_id    - optional specialty a patient asks for
--
-- The existing TEXT columns (therapists.specialty) are kept as a denormalized
-- display value so nothing that reads them breaks; the backend keeps them in
-- sync when a specialty_id is set.
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS specialties
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(150) NOT NULL UNIQUE,
    name_ar    VARCHAR(150),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specialties_active ON specialties (is_active);

-- Seed a starting catalogue (skipped if names already exist).
INSERT INTO specialties (name, name_ar)
VALUES
    ('Orthopedic Physiotherapy',   'العلاج الطبيعي للعظام'),
    ('Neurological Physiotherapy', 'العلاج الطبيعي للأعصاب'),
    ('Sports Physiotherapy',       'العلاج الطبيعي الرياضي'),
    ('Pediatric Physiotherapy',    'العلاج الطبيعي للأطفال'),
    ('Geriatric Physiotherapy',    'العلاج الطبيعي لكبار السن'),
    ('Cardiopulmonary Physiotherapy', 'العلاج الطبيعي للقلب والصدر'),
    ('Post-Surgical Rehabilitation', 'إعادة التأهيل بعد الجراحة'),
    ('Women''s Health Physiotherapy', 'العلاج الطبيعي لصحة المرأة')
ON CONFLICT (name) DO NOTHING;

-- Add the reference columns.
ALTER TABLE therapists
    ADD COLUMN IF NOT EXISTS specialty_id INTEGER REFERENCES specialties (id);

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS specialty_id INTEGER REFERENCES specialties (id);

CREATE INDEX IF NOT EXISTS idx_therapists_specialty_id ON therapists (specialty_id);
CREATE INDEX IF NOT EXISTS idx_requests_specialty_id   ON requests (specialty_id);

-- Backfill: turn each distinct existing therapist.specialty text into a
-- specialties row, then link therapists.specialty_id to it.
INSERT INTO specialties (name)
SELECT DISTINCT TRIM(specialty)
FROM therapists
WHERE specialty IS NOT NULL
  AND TRIM(specialty) <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE therapists t
SET specialty_id = s.id
FROM specialties s
WHERE t.specialty_id IS NULL
  AND t.specialty IS NOT NULL
  AND TRIM(t.specialty) = s.name;

COMMENT ON COLUMN therapists.specialty_id IS 'Managed specialty (specialties.id); therapists.specialty kept as display text';
COMMENT ON COLUMN requests.specialty_id IS 'Optional specialty the patient is requesting; NULL = any specialty';

------------------------------------------------------------------------------
-- DONE.
------------------------------------------------------------------------------

-- ============================================================================
-- FROM: 008_visit_reviews.sql
-- ============================================================================
------------------------------------------------------------------------------
-- VISIT REVIEWS (patient rates the therapist after a completed home visit)
-- Run in the Supabase SQL Editor. Idempotent.
--
-- One review per visit (a patient can review only a visit they had, once).
-- Reviews are tied to the visit, so they're only possible after the doctor
-- marked the visit "done".
--
-- Aggregate columns on `therapists` (rating_avg, rating_count) are kept in
-- sync by triggers, so listing a doctor's rating never needs a join/scan.
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS visit_reviews
(
    id           SERIAL PRIMARY KEY,
    visit_id     INTEGER NOT NULL UNIQUE REFERENCES visits (id) ON DELETE CASCADE,
    therapist_id INTEGER NOT NULL REFERENCES therapists (id) ON DELETE CASCADE,
    patient_id   INTEGER NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_reviews_therapist ON visit_reviews (therapist_id);
CREATE INDEX IF NOT EXISTS idx_visit_reviews_patient   ON visit_reviews (patient_id);

ALTER TABLE visit_reviews ENABLE ROW LEVEL SECURITY;

-- Denormalized rating aggregate on the therapist (fast reads everywhere).
ALTER TABLE therapists
    ADD COLUMN IF NOT EXISTS rating_avg   NUMERIC(3, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating_count INTEGER       NOT NULL DEFAULT 0;

------------------------------------------------------------------------------
-- Recompute a therapist's rating aggregate from visit_reviews
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION recompute_therapist_rating(p_therapist_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE therapists t
    SET rating_count = agg.cnt,
        rating_avg   = COALESCE(agg.avg, 0)
    FROM (
        SELECT COUNT(*)::INT AS cnt, ROUND(AVG(rating), 2) AS avg
        FROM visit_reviews
        WHERE therapist_id = p_therapist_id
    ) agg
    WHERE t.id = p_therapist_id;
END;
$$;

CREATE OR REPLACE FUNCTION trg_visit_reviews_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recompute_therapist_rating(OLD.therapist_id);
        RETURN OLD;
    END IF;
    PERFORM recompute_therapist_rating(NEW.therapist_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS visit_reviews_sync ON visit_reviews;
CREATE TRIGGER visit_reviews_sync
    AFTER INSERT OR UPDATE OR DELETE ON visit_reviews
    FOR EACH ROW EXECUTE FUNCTION trg_visit_reviews_sync();

-- Notify the therapist when they receive a review.
CREATE OR REPLACE FUNCTION notify_therapist_new_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only if the notifications table exists (migration 006); guard softly.
    BEGIN
        INSERT INTO notifications (user_id, type, title, title_ar, body, body_ar, reference_type, reference_id)
        SELECT t.user_id, 'review_received',
               'You received a review',
               'لقد تلقيت تقييمًا',
               'A patient rated your visit ' || NEW.rating || '/5' ||
                   CASE WHEN NEW.comment IS NOT NULL AND TRIM(NEW.comment) <> ''
                        THEN ': "' || NEW.comment || '"' ELSE '.' END,
               'قيّم مريض زيارتك ' || NEW.rating || '/5' ||
                   CASE WHEN NEW.comment IS NOT NULL AND TRIM(NEW.comment) <> ''
                        THEN ': "' || NEW.comment || '"' ELSE '.' END,
               'review', NEW.id
        FROM therapists t WHERE t.id = NEW.therapist_id;
    EXCEPTION WHEN undefined_table THEN
        NULL;
    END;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS visit_reviews_notify ON visit_reviews;
CREATE TRIGGER visit_reviews_notify
    AFTER INSERT ON visit_reviews
    FOR EACH ROW EXECUTE FUNCTION notify_therapist_new_review();

------------------------------------------------------------------------------
-- DONE. Verify:  SELECT id, rating_avg, rating_count FROM therapists;
------------------------------------------------------------------------------

-- ============================================================================
-- FROM: 003_seed_locations.sql
-- ============================================================================
------------------------------------------------------------------------------
-- SEED `locations` (service areas)
-- Run in the Supabase SQL Editor. Idempotent: ON CONFLICT keeps it re-runnable.
--
-- These are the predefined service areas a therapist picks from for "Areas
-- covered" (therapist_locations) and that patient requests reference
-- (requests.location_id). Coordinates are governorate centers; the *_delta
-- values are the map zoom span used by the patient app's map.
------------------------------------------------------------------------------
INSERT INTO locations (location_name, latitude, longitude, latitude_delta, longitude_delta)
VALUES
    ('Cairo',          30.0444, 31.2357, 0.30, 0.30),
    ('Giza',           30.0131, 31.2089, 0.30, 0.30),
    ('Alexandria',     31.2001, 29.9187, 0.30, 0.30),
    ('Qalyubia',       30.4292, 31.2045, 0.25, 0.25),
    ('Port Said',      31.2653, 32.3019, 0.20, 0.20),
    ('Suez',           29.9668, 32.5498, 0.20, 0.20),
    ('Dakahlia',       31.0409, 31.3785, 0.30, 0.30),
    ('Sharqia',        30.7327, 31.7195, 0.30, 0.30),
    ('Gharbia',        30.8754, 31.0335, 0.25, 0.25),
    ('Monufia',        30.5972, 30.9876, 0.25, 0.25),
    ('Beheira',        30.8481, 30.3436, 0.40, 0.40),
    ('Kafr El Sheikh', 31.1107, 30.9388, 0.30, 0.30),
    ('Damietta',       31.4165, 31.8133, 0.20, 0.20),
    ('Ismailia',       30.5965, 32.2715, 0.30, 0.30),
    ('Fayoum',         29.3084, 30.8428, 0.30, 0.30),
    ('Beni Suef',      29.0661, 31.0994, 0.30, 0.30),
    ('Minya',          28.1099, 30.7503, 0.40, 0.40),
    ('Asyut',          27.1809, 31.1837, 0.40, 0.40),
    ('Sohag',          26.5569, 31.6948, 0.40, 0.40),
    ('Qena',           26.1551, 32.7160, 0.40, 0.40),
    ('Luxor',          25.6872, 32.6396, 0.30, 0.30),
    ('Aswan',          24.0889, 32.8998, 0.50, 0.50),
    ('Red Sea',        26.0667, 33.8500, 1.50, 1.50),
    ('New Valley',     25.4477, 30.5582, 2.00, 2.00),
    ('Matrouh',        31.3543, 27.2373, 1.50, 1.50),
    ('North Sinai',    30.2824, 33.6176, 1.00, 1.00),
    ('South Sinai',    28.8765, 33.9734, 1.00, 1.00)
ON CONFLICT (location_name) DO NOTHING;

------------------------------------------------------------------------------
-- DONE. Verify:  SELECT COUNT(*) FROM locations;
------------------------------------------------------------------------------

-- ============================================================================
-- FROM: 004_delete_user_completely.sql
-- ============================================================================
------------------------------------------------------------------------------
-- DELETE A USER COMPLETELY (all related rows in every table + auth account)
--
-- 1. Run this whole file ONCE in the Supabase SQL Editor to create the
--    functions.
-- 2. Then delete any user with:
--
--      SELECT delete_user_completely(7);                          -- by users.id
--      SELECT delete_user_completely(
--          (SELECT id FROM users WHERE email = 'user2@mail.com')  -- by email
--      );
--      SELECT delete_user_completely(
--          (SELECT id FROM users WHERE phone_number = '12344567890')
--      );
--
-- It removes, in FK-safe order:
--   PATIENT side : product_reviews, program_reviews, subscriptions, payments,
--                  order_items, orders, user_cart, patient_addresses,
--                  patient_sheets, visits, therapist_notifications, requests,
--                  patients
--   THERAPIST side: documents, weekly availability, schedule overrides,
--                  covered areas, notifications, visits, therapists
--   ROLE rows    : admins (un-references reviews first), superusers, consultants
--   ANALYTICS    : product_views, cart_events, cart_snapshots, checkout_events,
--                  user_sessions
--   CORE         : otps, users
--   AUTH         : auth.users (so the email/phone can sign up again)
--
-- Tables that don't exist in this database are skipped silently.
-- Returns a JSON summary of how many rows were removed per table.
------------------------------------------------------------------------------

-- Helper: execute one statement, return affected row count.
-- Skips silently (returns 0) if the table/column doesn't exist.
CREATE OR REPLACE FUNCTION _delete_user_exec(p_sql TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    EXECUTE p_sql;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
EXCEPTION
    WHEN undefined_table OR undefined_column THEN
        RETURN 0;
END;
$$;

CREATE OR REPLACE FUNCTION delete_user_completely(p_user_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_supabase_id  UUID;
    v_patient_id   INTEGER;
    v_therapist_id INTEGER;
    v_admin_id     INTEGER;
    v_summary      JSONB := '{}'::jsonb;
    v_step         RECORD;
    v_count        INTEGER;
    v_steps        TEXT[][];
BEGIN
    SELECT supabase_id INTO v_supabase_id FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'user not found', 'user_id', p_user_id);
    END IF;

    SELECT id INTO v_patient_id   FROM patients   WHERE user_id = p_user_id;
    SELECT id INTO v_therapist_id FROM therapists WHERE user_id = p_user_id;
    SELECT id INTO v_admin_id     FROM admins     WHERE user_id = p_user_id;

    v_steps := ARRAY[]::TEXT[][];

    --------------------------------------------------------------------------
    -- PATIENT branch
    --------------------------------------------------------------------------
    IF v_patient_id IS NOT NULL THEN
        v_steps := v_steps || ARRAY[
            ARRAY['product_reviews',
                format('DELETE FROM product_reviews WHERE patient_id = %s', v_patient_id)],
            ARRAY['exercise_program_subscriptions',
                format('DELETE FROM exercise_program_subscriptions WHERE patient_id = %s', v_patient_id)],
            ARRAY['payments',
                format('DELETE FROM payments WHERE patient_id = %s', v_patient_id)],
            -- analytics rows that point at this patient's orders
            ARRAY['cart_snapshots_unlink_orders',
                format('UPDATE cart_snapshots SET converted_to_order_id = NULL
                        WHERE converted_to_order_id IN (SELECT id FROM orders WHERE patient_id = %s)', v_patient_id)],
            ARRAY['checkout_events_for_orders',
                format('DELETE FROM checkout_events
                        WHERE order_id IN (SELECT id FROM orders WHERE patient_id = %s)', v_patient_id)],
            ARRAY['order_items',
                format('DELETE FROM order_items
                        WHERE order_id IN (SELECT id FROM orders WHERE patient_id = %s)', v_patient_id)],
            ARRAY['orders',
                format('DELETE FROM orders WHERE patient_id = %s', v_patient_id)],
            ARRAY['patient_addresses',
                format('DELETE FROM patient_addresses WHERE patient_id = %s', v_patient_id)],
            ARRAY['patient_sheets',
                format('DELETE FROM patient_sheets WHERE patient_id = %s', v_patient_id)],
            -- home-visit chain: visits -> notifications -> requests
            ARRAY['visits_as_patient',
                format('DELETE FROM visits WHERE patient_id = %s', v_patient_id)],
            ARRAY['therapist_notifications_for_requests',
                format('DELETE FROM therapist_notifications
                        WHERE request_id IN (SELECT id FROM requests WHERE patient_id = %s)', v_patient_id)],
            ARRAY['requests',
                format('DELETE FROM requests WHERE patient_id = %s', v_patient_id)],
            ARRAY['patients',
                format('DELETE FROM patients WHERE id = %s', v_patient_id)]
        ];
    END IF;

    --------------------------------------------------------------------------
    -- THERAPIST branch
    --------------------------------------------------------------------------
    IF v_therapist_id IS NOT NULL THEN
        v_steps := v_steps || ARRAY[
            ARRAY['therapist_documents',
                format('DELETE FROM therapist_documents WHERE therapist_id = %s', v_therapist_id)],
            ARRAY['therapist_weekly_availability',
                format('DELETE FROM therapist_weekly_availability WHERE therapist_id = %s', v_therapist_id)],
            ARRAY['therapist_schedule_overrides',
                format('DELETE FROM therapist_schedule_overrides WHERE therapist_id = %s', v_therapist_id)],
            ARRAY['therapist_locations',
                format('DELETE FROM therapist_locations WHERE therapist_id = %s', v_therapist_id)],
            ARRAY['therapist_notifications',
                format('DELETE FROM therapist_notifications WHERE therapist_id = %s', v_therapist_id)],
            ARRAY['visits_as_therapist',
                format('DELETE FROM visits WHERE therapist_id = %s', v_therapist_id)],
            ARRAY['therapists',
                format('DELETE FROM therapists WHERE id = %s', v_therapist_id)]
        ];
    END IF;

    --------------------------------------------------------------------------
    -- ADMIN / role rows (un-reference reviewed_by pointers first)
    --------------------------------------------------------------------------
    IF v_admin_id IS NOT NULL THEN
        v_steps := v_steps || ARRAY[
            ARRAY['requests_reviewed_by',
                format('UPDATE requests SET reviewed_by = NULL WHERE reviewed_by = %s', v_admin_id)],
            ARRAY['therapists_reviewed_by',
                format('UPDATE therapists SET reviewed_by = NULL WHERE reviewed_by = %s', v_admin_id)],
            ARRAY['therapist_documents_reviewed_by',
                format('UPDATE therapist_documents SET reviewed_by = NULL WHERE reviewed_by = %s', v_admin_id)],
            ARRAY['admins',
                format('DELETE FROM admins WHERE id = %s', v_admin_id)]
        ];
    END IF;

    --------------------------------------------------------------------------
    -- CART, ANALYTICS, CORE
    --------------------------------------------------------------------------
    v_steps := v_steps || ARRAY[
        ARRAY['superusers',  format('DELETE FROM superusers  WHERE user_id = %s', p_user_id)],
        ARRAY['consultants', format('DELETE FROM consultants WHERE user_id = %s', p_user_id)],
        ARRAY['user_cart',   format('DELETE FROM user_cart   WHERE user_id = %s', p_user_id)],

        ARRAY['product_views',   format('DELETE FROM product_views   WHERE user_id = %s', p_user_id)],
        ARRAY['cart_events',     format('DELETE FROM cart_events     WHERE user_id = %s', p_user_id)],
        ARRAY['cart_snapshots',  format('DELETE FROM cart_snapshots  WHERE user_id = %s', p_user_id)],
        ARRAY['checkout_events', format('DELETE FROM checkout_events WHERE user_id = %s', p_user_id)],

        -- analytics rows hanging off this user's sessions, then the sessions
        ARRAY['product_views_by_session',
            format('DELETE FROM product_views WHERE session_id IN
                    (SELECT id FROM user_sessions WHERE user_id = %s)', p_user_id)],
        ARRAY['cart_events_by_session',
            format('DELETE FROM cart_events WHERE session_id IN
                    (SELECT id FROM user_sessions WHERE user_id = %s)', p_user_id)],
        ARRAY['cart_snapshots_by_session',
            format('DELETE FROM cart_snapshots WHERE session_id IN
                    (SELECT id FROM user_sessions WHERE user_id = %s)', p_user_id)],
        ARRAY['checkout_events_by_session',
            format('DELETE FROM checkout_events WHERE session_id IN
                    (SELECT id FROM user_sessions WHERE user_id = %s)', p_user_id)],
        ARRAY['user_sessions', format('DELETE FROM user_sessions WHERE user_id = %s', p_user_id)],

        ARRAY['orders_cancelled_by',
            format('UPDATE orders SET cancelled_by = NULL WHERE cancelled_by = %s', p_user_id)],
        ARRAY['program_reviews', format('DELETE FROM program_reviews WHERE user_id = %s', p_user_id)],
        ARRAY['otps',            format('DELETE FROM otps            WHERE user_id = %s', p_user_id)],

        ARRAY['users', format('DELETE FROM users WHERE id = %s', p_user_id)]
    ];

    --------------------------------------------------------------------------
    -- Execute all steps in order
    --------------------------------------------------------------------------
    FOR v_step IN
        SELECT v_steps[i][1] AS label, v_steps[i][2] AS sql
        FROM generate_subscripts(v_steps, 1) AS i
    LOOP
        v_count := _delete_user_exec(v_step.sql);
        IF v_count > 0 THEN
            v_summary := v_summary || jsonb_build_object(v_step.label, v_count);
        END IF;
    END LOOP;

    --------------------------------------------------------------------------
    -- AUTH: remove the login so the email/phone can register again
    --------------------------------------------------------------------------
    IF v_supabase_id IS NOT NULL THEN
        v_count := _delete_user_exec(
            format('DELETE FROM auth.users WHERE id = %L', v_supabase_id));
        IF v_count > 0 THEN
            v_summary := v_summary || jsonb_build_object('auth_users', v_count);
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'supabase_id', v_supabase_id,
        'deleted', v_summary
    );
END;
$$;

-- Only privileged contexts may call these (SQL editor / service role).
REVOKE ALL ON FUNCTION delete_user_completely(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION _delete_user_exec(TEXT) FROM PUBLIC, anon, authenticated;

------------------------------------------------------------------------------
-- USAGE EXAMPLES (run any of these after creating the functions):
--
--   SELECT delete_user_completely(7);
--   SELECT delete_user_completely((SELECT id FROM users WHERE email = 'user2@mail.com'));
--
-- Delete several at once:
--   SELECT delete_user_completely(id) FROM users
--   WHERE email IN ('user2@mail.com', 'user3@mail.com', 'test.dd@gmail.com');
--
-- The returned JSON shows exactly how many rows were removed per table, e.g.
--   { "user_id": 7, "deleted": { "orders": 2, "order_items": 5, "patients": 1,
--     "users": 1, "auth_users": 1, ... } }
------------------------------------------------------------------------------

-- ============================================================================
-- FROM: 002_enable_rls.sql
-- ============================================================================
------------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY ON ALL PUBLIC TABLES
-- Run in Supabase SQL Editor. Idempotent and safe to re-run.
--
-- WHY: The platform talks to the database through the backend API using the
--      service-role key, which BYPASSES RLS. Enabling RLS with no permissive
--      policies therefore does NOT break the API — it only closes the hole
--      where the public anon key could read public tables directly.
--      This silences the Supabase Advisor "RLS Disabled in Public" warnings.
--
-- NOTE: The app accesses Supabase Storage (therapist-documents) and Auth
--       directly; those are unaffected (Storage has its own policies from
--       migration 001, Auth lives in the auth schema, not public).
--
-- IF you ever want the app to read a public table directly with the anon/auth
-- key, add an explicit policy for that table afterwards. With RLS on and no
-- policy, anon/authenticated get zero rows (service role still sees all).
------------------------------------------------------------------------------

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END
$$;

------------------------------------------------------------------------------
-- DONE. Re-run the Advisor; the "RLS Disabled in Public" items should clear.
-- The backend API (service role) continues to work unchanged.
------------------------------------------------------------------------------
