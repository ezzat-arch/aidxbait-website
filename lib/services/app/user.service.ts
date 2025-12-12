import { PostgrestError } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Custom error classes for specific user validation scenarios
 */
export class UserNotFoundError extends Error {
	constructor() {
		super("User account not found. Please make sure you have signed up.");
		this.name = "UserNotFoundError";
	}
}

export class NonPatientUserError extends Error {
	constructor() {
		super(
			"You don't have a patient account on this platform. Please contact support if you believe this is an error."
		);
		this.name = "NonPatientUserError";
	}
}

export class MissingPatientRecordError extends Error {
	constructor() {
		super(
			"There seems to be an issue with your account. Please contact support for assistance."
		);
		this.name = "MissingPatientRecordError";
	}
}

/**
 * User details returned by getUserBySupabaseId
 */
export interface UserDetails {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	image_url: string;
	patient_id: number;
}

/**
 * Data required to create a new app user
 */
export interface CreateAppUserData {
	first_name: string;
	last_name: string;
	email: string;
	supabase_id: string;
	phone_number: string;
	image_url?: string;
}

/**
 * Result of creating a new user
 */
export interface CreateUserResult {
	user_id: number;
	patient_id: number;
}

/**
 * Fetch a user (and their patient id) by their Supabase Auth UUID.
 * Only allows patients to sign in - throws specific errors for other scenarios.
 *
 * @param supabaseId - The UUID from auth.users
 * @returns User details including patient_id
 * @throws UserNotFoundError if user doesn't exist
 * @throws NonPatientUserError if user is not a patient
 * @throws MissingPatientRecordError if patient record doesn't exist
 */
export async function getUserBySupabaseId(
	supabaseId: string
): Promise<UserDetails> {
	// Fetch the base user row
	const { data: user, error: userError } = await supabaseAdmin
		.from("users")
		.select(
			"id, first_name, last_name, email, phone_number, image_url, user_type"
		)
		.eq("supabase_id", supabaseId)
		.single();

	if (userError) {
		if (userError.code === "PGRST116") {
			// Row not found - user doesn't exist
			throw new UserNotFoundError();
		}
		// Other database errors
		throw userError;
	}

	// Only allow patient user types to log in
	if (user.user_type !== "patient") {
		throw new NonPatientUserError();
	}

	// For patient users, ensure they have a patient record
	const { data: patient, error: patientError } = await supabaseAdmin
		.from("patients")
		.select("id")
		.eq("user_id", user.id)
		.single();

	if (patientError) {
		if (patientError.code === "PGRST116") {
			// Row not found - patient record doesn't exist
			throw new MissingPatientRecordError();
		}
		// Other database errors
		throw patientError;
	}

	if (!patient?.id) {
		throw new MissingPatientRecordError();
	}

	return {
		...user,
		patient_id: patient.id,
	};
}

/**
 * Create a new app user with corresponding patient record.
 * This is specifically for mobile app users.
 *
 * @param data - User creation data
 * @returns Object with user_id and patient_id
 */
export async function createAppUser(
	data: CreateAppUserData
): Promise<CreateUserResult> {
	// Step 1: Insert into users table
	const { data: userData, error: userError } = await supabaseAdmin
		.from("users")
		.insert([
			{
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				supabase_id: data.supabase_id,
				phone_number: data.phone_number,
				image_url: data.image_url || "",
				user_type: "patient",
				is_website_user: false,
			},
		])
		.select("id")
		.single();

	if (userError) {
		throw userError;
	}

	// Step 2: Insert into patients table with placeholder date_of_birth
	const { data: patientData, error: patientError } = await supabaseAdmin
		.from("patients")
		.insert([
			{
				user_id: userData.id,
				date_of_birth: "1888-01-01", // Placeholder date
			},
		])
		.select("id")
		.single();

	if (patientError) {
		// If patient creation fails, we should ideally rollback the user creation
		// For now, throw the error - consider implementing proper transaction handling
		throw patientError;
	}

	return {
		user_id: userData.id,
		patient_id: patientData.id,
	};
}

/**
 * Data for updating user profile
 */
export interface UpdateUserData {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone_number?: string;
	image_url?: string;
}

/**
 * Result of updating a user
 */
export interface UpdateUserResult {
	user: UserDetails;
	emailVerificationPending: boolean;
}

/**
 * Update user profile with transaction-like consistency.
 * Updates both the public.users table and Supabase Auth credentials.
 *
 * Flow:
 * 1. First update Supabase Auth (most failure-prone step)
 * 2. Then update public.users table
 * 3. If DB update fails, rollback Auth changes
 *
 * @param supabaseId - The Supabase Auth UUID
 * @param data - Fields to update
 * @returns Updated user details and email verification status
 */
export async function updateUser(
	supabaseId: string,
	data: UpdateUserData
): Promise<UpdateUserResult> {
	// First, fetch current user to get original values for potential rollback
	const { data: currentUser, error: fetchError } = await supabaseAdmin
		.from("users")
		.select(
			"id, first_name, last_name, email, phone_number, image_url, user_type"
		)
		.eq("supabase_id", supabaseId)
		.single();

	if (fetchError) {
		if (fetchError.code === "PGRST116") {
			throw new UserNotFoundError();
		}
		throw fetchError;
	}

	// Store original auth values for potential rollback
	const originalEmail = currentUser.email;
	const originalPhone = currentUser.phone_number;

	let emailVerificationPending = false;
	let authUpdatePerformed = false;

	// Step 1: Update Supabase Auth if email or phone changed
	const authUpdates: { email?: string; phone?: string } = {};

	if (data.email && data.email !== originalEmail) {
		authUpdates.email = data.email;
	}
	if (data.phone_number && data.phone_number !== originalPhone) {
		authUpdates.phone = data.phone_number;
	}

	if (Object.keys(authUpdates).length > 0) {
		const { data: authData, error: authError } =
			await supabaseAdmin.auth.admin.updateUserById(supabaseId, authUpdates);

		if (authError) {
			// Auth update failed - throw error with user-friendly message
			if (authError.message?.includes("already been registered")) {
				throw new Error("This email is already in use by another account.");
			}
			if (authError.message?.includes("phone")) {
				throw new Error(
					"This phone number is already in use by another account."
				);
			}
			throw new Error(
				authError.message || "Failed to update authentication credentials."
			);
		}

		authUpdatePerformed = true;

		// Check if email verification is pending
		// When email is changed, Supabase may require verification
		if (authUpdates.email && authData.user?.email !== authUpdates.email) {
			// Email hasn't changed yet - verification is pending
			emailVerificationPending = true;
		}
	}

	// Step 2: Update public.users table
	const dbUpdates: Partial<{
		first_name: string;
		last_name: string;
		email: string;
		phone_number: string;
		image_url: string;
	}> = {};

	if (data.first_name !== undefined) dbUpdates.first_name = data.first_name;
	if (data.last_name !== undefined) dbUpdates.last_name = data.last_name;
	// Only update email in DB if no verification is pending
	if (data.email !== undefined && !emailVerificationPending) {
		dbUpdates.email = data.email;
	}
	if (data.phone_number !== undefined)
		dbUpdates.phone_number = data.phone_number;
	if (data.image_url !== undefined) dbUpdates.image_url = data.image_url;

	if (Object.keys(dbUpdates).length > 0) {
		const { error: dbError } = await supabaseAdmin
			.from("users")
			.update(dbUpdates)
			.eq("supabase_id", supabaseId);

		if (dbError) {
			// Step 3: Rollback Auth changes if DB update failed
			if (authUpdatePerformed) {
				const rollbackUpdates: { email?: string; phone?: string } = {};
				if (authUpdates.email) rollbackUpdates.email = originalEmail;
				if (authUpdates.phone) rollbackUpdates.phone = originalPhone;

				await supabaseAdmin.auth.admin.updateUserById(
					supabaseId,
					rollbackUpdates
				);
			}

			throw dbError;
		}
	}

	// Fetch and return updated user
	const updatedUser = await getUserBySupabaseId(supabaseId);

	return {
		user: updatedUser,
		emailVerificationPending,
	};
}

/**
 * Soft delete a user account.
 *
 * This function performs a soft delete which:
 * 1. Sets is_soft_deleted = true and deleted_at = NOW() in public.users
 * 2. Clears supabase_id to NULL (since auth record will be deleted)
 * 3. Deletes the user from Supabase Auth (hard delete)
 *
 * The soft delete preserves all historical data (orders, payments, etc.)
 * while preventing the user from logging in. The email/phone can be
 * reused for new registrations after deletion.
 *
 * @param supabaseId - The Supabase Auth UUID of the user to delete
 * @throws UserNotFoundError if user doesn't exist
 * @throws NonPatientUserError if user is not a patient
 * @throws Error if deletion fails
 */
export async function softDeleteUser(supabaseId: string): Promise<void> {
	// Step 1: Verify user exists and is a patient
	const { data: user, error: fetchError } = await supabaseAdmin
		.from("users")
		.select("id, user_type, is_soft_deleted")
		.eq("supabase_id", supabaseId)
		.single();

	if (fetchError) {
		if (fetchError.code === "PGRST116") {
			throw new UserNotFoundError();
		}
		throw fetchError;
	}

	// Only allow patients to delete their accounts via this endpoint
	if (user.user_type !== "patient") {
		throw new NonPatientUserError();
	}

	// Check if already soft deleted
	if (user.is_soft_deleted) {
		throw new Error("This account has already been deleted.");
	}

	// Step 2: Soft delete the user record in public.users
	// Set is_soft_deleted = true, deleted_at = now(), and clear supabase_id
	const { error: updateError } = await supabaseAdmin
		.from("users")
		.update({
			is_soft_deleted: true,
			deleted_at: new Date().toISOString(),
			supabase_id: null,
		})
		.eq("id", user.id);

	if (updateError) {
		throw new Error(
			`Failed to soft delete user record: ${updateError.message}`
		);
	}

	// Step 3: Delete the user from Supabase Auth (hard delete)
	// This removes their ability to log in
	const { error: authDeleteError } =
		await supabaseAdmin.auth.admin.deleteUser(supabaseId);

	if (authDeleteError) {
		// If auth deletion fails, we should rollback the soft delete
		// to maintain consistency
		await supabaseAdmin
			.from("users")
			.update({
				is_soft_deleted: false,
				deleted_at: null,
				supabase_id: supabaseId,
			})
			.eq("id", user.id);

		throw new Error(
			`Failed to delete authentication account: ${authDeleteError.message}`
		);
	}
}

/**
 * Helper to translate Supabase errors into user-friendly strings.
 */
export function translateSupabaseError(error: PostgrestError): string {
	switch (error.code) {
		case "23505":
			return "A user with these details already exists.";
		case "23503":
			return "Invalid reference data provided.";
		case "23502":
			return "Required field is missing.";
		default:
			return error.message || "An unexpected database error occurred.";
	}
}
