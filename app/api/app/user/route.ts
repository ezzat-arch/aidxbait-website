import { NextRequest, NextResponse } from "next/server";
import {
	getUserBySupabaseId,
	createAppUser,
	updateUser,
	softDeleteUser,
	UserNotFoundError,
	NonPatientUserError,
	MissingPatientRecordError,
	translateSupabaseError,
	CreateAppUserData,
	UpdateUserData,
} from "@/lib/services/app/user.service";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * GET /api/app/user
 *
 * Fetch user details by Supabase ID
 * Query param: supabaseId
 *
 * Success: { success: true, data: UserDetails }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Missing supabaseId query parameter",
					},
				},
				{ status: 400 }
			);
		}

		const data = await getUserBySupabaseId(supabaseId);

		return NextResponse.json({
			success: true,
			data,
		});
	} catch (err: unknown) {
		// Handle custom errors with specific status codes
		if (err instanceof UserNotFoundError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "UserNotFoundError",
						message: err.message,
					},
				},
				{ status: 404 }
			);
		}

		if (err instanceof NonPatientUserError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "NonPatientUserError",
						message: err.message,
					},
				},
				{ status: 403 }
			);
		}

		if (err instanceof MissingPatientRecordError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "MissingPatientRecordError",
						message: err.message,
					},
				},
				{ status: 422 }
			);
		}

		// Handle Supabase/database errors
		const error = err as PostgrestError;
		const message = error?.code
			? translateSupabaseError(error)
			: (err as Error)?.message || "An unexpected error occurred";

		return NextResponse.json(
			{
				success: false,
				error: {
					type: "DatabaseError",
					message,
				},
			},
			{ status: 500 }
		);
	}
}

/**
 * POST /api/app/user
 *
 * Create a new app user with patient record
 * Body: { first_name, last_name, email, supabase_id, phone_number, image_url? }
 *
 * Success: { success: true, data: { user_id, patient_id } }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as CreateAppUserData;

		// Validate required fields
		const requiredFields = [
			"first_name",
			"last_name",
			"email",
			"supabase_id",
			"phone_number",
		];
		const missingFields = requiredFields.filter(
			(field) => !body[field as keyof CreateAppUserData]
		);

		if (missingFields.length > 0) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: `Missing required fields: ${missingFields.join(", ")}`,
					},
				},
				{ status: 400 }
			);
		}

		const result = await createAppUser(body);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (err: unknown) {
		const error = err as PostgrestError;

		// Handle duplicate user errors
		if (error?.code === "23505") {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "DuplicateUserError",
						message: translateSupabaseError(error),
					},
				},
				{ status: 409 }
			);
		}

		// Handle other Supabase/database errors
		const message = error?.code
			? translateSupabaseError(error)
			: (err as Error)?.message || "An unexpected error occurred";

		return NextResponse.json(
			{
				success: false,
				error: {
					type: "DatabaseError",
					message,
				},
			},
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/app/user
 *
 * Update user profile (first_name, last_name, email, phone_number)
 * Updates both public.users table and Supabase Auth credentials.
 *
 * Body: { supabase_id, first_name?, last_name?, email?, phone_number? }
 *
 * Success: { success: true, data: { user, emailVerificationPending } }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, ...updateData } = body as {
			supabase_id: string;
		} & UpdateUserData;

		// Validate supabase_id is provided
		if (!supabase_id) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Missing supabase_id in request body",
					},
				},
				{ status: 400 }
			);
		}

		// Validate at least one field to update
		const hasUpdates = Object.values(updateData).some(
			(value) => value !== undefined && value !== ""
		);

		if (!hasUpdates) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "No fields to update provided",
					},
				},
				{ status: 400 }
			);
		}

		// Validate email format if provided
		if (updateData.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(updateData.email)) {
				return NextResponse.json(
					{
						success: false,
						error: {
							type: "ValidationError",
							message: "Invalid email format",
						},
					},
					{ status: 400 }
				);
			}
		}

		const result = await updateUser(supabase_id, updateData);

		return NextResponse.json({
			success: true,
			data: {
				user: result.user,
				emailVerificationPending: result.emailVerificationPending,
			},
		});
	} catch (err: unknown) {
		// Handle custom errors
		if (err instanceof UserNotFoundError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "UserNotFoundError",
						message: err.message,
					},
				},
				{ status: 404 }
			);
		}

		const error = err as Error;

		// Handle duplicate email/phone errors
		if (error.message?.includes("already in use")) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "DuplicateError",
						message: error.message,
					},
				},
				{ status: 409 }
			);
		}

		// Handle Supabase/database errors
		const postgrestError = err as PostgrestError;
		const message = postgrestError?.code
			? translateSupabaseError(postgrestError)
			: error?.message || "An unexpected error occurred";

		return NextResponse.json(
			{
				success: false,
				error: {
					type: "DatabaseError",
					message,
				},
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/app/user
 *
 * Soft delete a user account. This:
 * 1. Soft deletes the user record (is_soft_deleted = true, deleted_at = NOW())
 * 2. Clears the supabase_id reference
 * 3. Hard deletes the auth.users record (removes login ability)
 *
 * Query param: supabaseId
 *
 * Success: { success: true, message: string }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Missing supabaseId query parameter",
					},
				},
				{ status: 400 }
			);
		}

		await softDeleteUser(supabaseId);

		return NextResponse.json({
			success: true,
			message: "Account deleted successfully",
		});
	} catch (err: unknown) {
		// Handle custom errors with specific status codes
		if (err instanceof UserNotFoundError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "UserNotFoundError",
						message: err.message,
					},
				},
				{ status: 404 }
			);
		}

		if (err instanceof NonPatientUserError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "NonPatientUserError",
						message: err.message,
					},
				},
				{ status: 403 }
			);
		}

		const error = err as Error;

		// Handle already deleted error
		if (error.message?.includes("already been deleted")) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "AlreadyDeletedError",
						message: error.message,
					},
				},
				{ status: 400 }
			);
		}

		// Handle other errors
		return NextResponse.json(
			{
				success: false,
				error: {
					type: "ServerError",
					message: error?.message || "An unexpected error occurred",
				},
			},
			{ status: 500 }
		);
	}
}
