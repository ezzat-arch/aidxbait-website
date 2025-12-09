import { NextRequest, NextResponse } from "next/server";
import {
	signUpAppUser,
	SignUpAppUserData,
} from "@/lib/services/app/auth.service";
import { PostgrestError } from "@supabase/supabase-js";
import { translateSupabaseError } from "@/lib/services/app/user.service";

/**
 * POST /api/app/auth/signup
 *
 * Create a new mobile app user account with atomic transaction guarantees.
 * Creates both Supabase Auth user and database records (users + patients tables).
 *
 * Body: { email, password, first_name, last_name, phone_number }
 *
 * Success: { success: true, data: { session, user } }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as SignUpAppUserData;

		// Validate required fields
		const requiredFields: (keyof SignUpAppUserData)[] = [
			"email",
			"password",
			"first_name",
			"last_name",
			"phone_number",
		];
		const missingFields = requiredFields.filter((field) => !body[field]);

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

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.email)) {
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

		// Validate password length
		if (body.password.length < 6) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Password must be at least 6 characters long",
					},
				},
				{ status: 400 }
			);
		}

		// Call service to create user
		const result = await signUpAppUser(body);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (err: unknown) {
		console.error("Sign up error:", err);

		const error = err as Error & { code?: string };

		// Handle duplicate user errors (email already exists)
		if (
			error?.message?.includes("already registered") ||
			error?.message?.includes("duplicate")
		) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "DuplicateUserError",
						message: "A user with this email already exists",
					},
				},
				{ status: 409 }
			);
		}

		// Handle auth errors
		if (error?.message?.includes("auth")) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "AuthenticationError",
						message: error.message || "Failed to create authentication account",
					},
				},
				{ status: 400 }
			);
		}

		// Handle database errors
		if (
			error?.message?.includes("database") ||
			error?.message?.includes("Database")
		) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "DatabaseError",
						message: error.message || "Failed to create user profile",
					},
				},
				{ status: 500 }
			);
		}

		// Generic error
		const message =
			error?.message || "An unexpected error occurred during sign up";

		return NextResponse.json(
			{
				success: false,
				error: {
					type: "ServerError",
					message,
				},
			},
			{ status: 500 }
		);
	}
}
