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
