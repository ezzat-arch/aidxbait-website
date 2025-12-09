import { Session } from "@supabase/supabase-js";
import { supabaseAdmin, supabaseAuth } from "@/lib/supabase/admin";
import { UserDetails } from "./user.service";

/**
 * Data required to sign up a new app user
 */
export interface SignUpAppUserData {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone_number: string;
}

/**
 * Result of signing up a new app user
 */
export interface SignUpResult {
	session: Session;
	user: UserDetails;
}

/**
 * Sign up a new mobile app user with atomic transaction guarantees.
 *
 * This function ensures that both Supabase Auth user creation and database
 * record creation succeed together or both fail (rollback).
 *
 * @param data - Sign up data including email, password, and profile info
 * @returns Session and user details
 * @throws Error if sign up fails at any step
 */
export async function signUpAppUser(
	data: SignUpAppUserData
): Promise<SignUpResult> {
	const { email, password, first_name, last_name, phone_number } = data;

	// Step 1: Create Supabase Auth user
	const { data: authData, error: authError } =
		await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true, // Auto-confirm for mobile app users
			user_metadata: {
				first_name,
				last_name,
				phone_number,
			},
		});

	if (authError || !authData.user) {
		throw new Error(
			`Failed to create auth user: ${authError?.message || "Unknown error"}`
		);
	}

	const supabaseId = authData.user.id;

	try {
		// Step 2: Call database function to create users and patients records
		const { data: dbResult, error: dbError } = await supabaseAdmin.rpc(
			"create_app_user_with_patient",
			{
				p_supabase_id: supabaseId,
				p_first_name: first_name,
				p_last_name: last_name,
				p_email: email,
				p_phone_number: phone_number,
			}
		);

		if (dbError) {
			// Database function failed - rollback auth user
			await supabaseAdmin.auth.admin.deleteUser(supabaseId);
			throw new Error(`Failed to create database records: ${dbError.message}`);
		}

		// Check if the function returned a success result
		if (!dbResult || !dbResult.success) {
			// Database function returned failure - rollback auth user
			await supabaseAdmin.auth.admin.deleteUser(supabaseId);
			throw new Error(
				`Database function failed: ${
					dbResult?.error_message || "Unknown error"
				}`
			);
		}

		// Step 3: Create session for the user using regular auth client
		// Use the anon key client to sign in the newly created user
		const { data: signInData, error: signInError } =
			await supabaseAuth.auth.signInWithPassword({
				email,
				password,
			});

		if (signInError || !signInData.session) {
			// Session creation failed but user exists - don't rollback
			throw new Error(
				`Failed to create session: ${signInError?.message || "Unknown error"}`
			);
		}

		// Return session and user details
		return {
			session: signInData.session,
			user: {
				id: dbResult.user_id,
				first_name,
				last_name,
				email,
				phone_number,
				image_url: "",
				patient_id: dbResult.patient_id,
			},
		};
	} catch (error) {
		// If we got here and the error was thrown after auth user creation,
		// we should have already attempted rollback in the specific error cases above.
		// Just re-throw the error.
		throw error;
	}
}
