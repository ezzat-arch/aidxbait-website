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
