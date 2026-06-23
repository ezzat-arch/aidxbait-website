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
