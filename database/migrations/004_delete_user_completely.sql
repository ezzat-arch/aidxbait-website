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
