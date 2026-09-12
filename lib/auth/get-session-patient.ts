// lib/auth/get-session-patient.ts — who is calling, resolved from the session cookie
//
// SERVER ONLY. Every route that reads or writes a patient's own data derives the
// patient from here rather than trusting a `patient_id` in the request, which is
// what `/api/orders` and `/api/addresses` used to do.

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type SessionPatient = {
	/** Supabase auth user id (a UUID). */
	authUserId: string;
	/** `users.id`, our own integer id. Null when the account has no `users` row yet. */
	userId: number | null;
	/**
	 * `patients.id`. Null for an account that is not a patient (therapist, admin)
	 * or whose patient record has not been created. Not an error: such a caller
	 * simply has no orders and no addresses.
	 */
	patientId: number | null;
	email: string | null;
};

/**
 * The signed-in caller, or null when there is no session.
 *
 * `middleware.ts` returns early for `/api/`, which skips session *refresh* only.
 * `cookies()` still exposes the session to a route handler, so `auth.getUser()`
 * works here. This is the cookie session, not the `Authorization: Bearer` pattern
 * under `app/api/app/**`, which is the mobile app's.
 *
 * Callers should treat null as 401 and a null `patientId` as "no rows", never as
 * an error: the same query chain `getCheckoutPrefill` runs, kept in one place.
 */
export async function getSessionPatient(): Promise<SessionPatient | null> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return null;

		const session: SessionPatient = {
			authUserId: user.id,
			userId: null,
			patientId: null,
			email: user.email?.trim().toLowerCase() ?? null,
		};

		const { data: userRow, error: userError } = await supabaseAdmin
			.from("users")
			.select("id, email")
			.eq("supabase_id", user.id)
			.maybeSingle();

		if (userError) {
			console.error("[Auth] users lookup failed:", userError.message);
			return session;
		}
		if (!userRow) return session;

		session.userId = userRow.id;
		session.email = userRow.email?.trim().toLowerCase() ?? session.email;

		const { data: patient, error: patientError } = await supabaseAdmin
			.from("patients")
			.select("id")
			.eq("user_id", userRow.id)
			.maybeSingle();

		if (patientError) {
			console.error("[Auth] patients lookup failed:", patientError.message);
			return session;
		}

		session.patientId = patient?.id ?? null;
		return session;
	} catch (error) {
		// A broken session is not a session. The caller turns this into a 401.
		console.error("[Auth] session lookup threw:", error);
		return null;
	}
}
