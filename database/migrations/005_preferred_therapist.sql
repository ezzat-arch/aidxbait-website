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
