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
