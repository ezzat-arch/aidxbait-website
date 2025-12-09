import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 *
 * Uses the service role key for privileged database operations.
 * This client bypasses Row Level Security (RLS) policies.
 *
 * SECURITY: Never expose this client or service role key to client-side code.
 */
export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

/**
 * Regular Supabase Client for Auth Operations
 *
 * Uses the anon key for standard auth operations like sign in.
 * This is used to create sessions for users after registration.
 */
export const supabaseAuth = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);
