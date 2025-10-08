import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
	try {
		// Check environment variables first
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl) {
			console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
			return NextResponse.json(
				{
					success: false,
					error: "Server configuration error: Missing Supabase URL",
				},
				{ status: 500 }
			);
		}

		if (!supabaseServiceKey) {
			console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
			return NextResponse.json(
				{
					success: false,
					error: "Server configuration error: Missing service key",
				},
				{ status: 500 }
			);
		}

		// Create a Supabase client with service role key for admin operations
		// This bypasses RLS and allows us to perform privileged operations
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			console.error("Failed to parse request body:", parseError);
			return NextResponse.json(
				{ success: false, error: "Invalid request format" },
				{ status: 400 }
			);
		}

		const { firstName, lastName, email, phone, password } = body;

		console.log("Signup API called with:", {
			firstName,
			lastName,
			email,
			phone: phone ? "***" : undefined,
		});

		// Validate required fields
		if (
			!firstName?.trim() ||
			!lastName?.trim() ||
			!email?.trim() ||
			!phone?.trim() ||
			!password?.trim()
		) {
			return NextResponse.json(
				{ success: false, error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Step 1: Create auth user using admin client
		const { data: authData, error: authError } =
			await supabaseAdmin.auth.admin.createUser({
				email: email.trim(),
				password: password.trim(),
				email_confirm: true, // Skip email confirmation since it's disabled in settings
			});

		if (authError) {
			console.error("Auth error:", authError);
			return NextResponse.json(
				{ success: false, error: authError.message },
				{ status: 400 }
			);
		}

		if (!authData.user?.id) {
			return NextResponse.json(
				{ success: false, error: "Failed to create user account" },
				{ status: 500 }
			);
		}

		// Step 2: Create database records using RPC with admin privileges
		const { data: dbResult, error: dbError } = await supabaseAdmin.rpc(
			"create_website_user_with_patient",
			{
				p_supabase_id: authData.user.id,
				p_first_name: firstName.trim(),
				p_last_name: lastName.trim(),
				p_email: email.trim(),
				p_phone_number: phone.trim(),
			}
		);

		if (dbError) {
			console.error("Database error:", dbError);

			// If database creation fails, clean up the auth user
			try {
				await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
			} catch (cleanupError) {
				console.error("Failed to cleanup auth user:", cleanupError);
			}

			return NextResponse.json(
				{
					success: false,
					error: "Failed to create user profile. Please try again.",
				},
				{ status: 500 }
			);
		}

		// Check if the RPC function returned an error
		if (
			dbResult &&
			typeof dbResult === "object" &&
			"success" in dbResult &&
			!dbResult.success
		) {
			console.error("RPC function error:", dbResult);

			// Clean up the auth user
			try {
				await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
			} catch (cleanupError) {
				console.error("Failed to cleanup auth user:", cleanupError);
			}

			return NextResponse.json(
				{
					success: false,
					error: dbResult.error_message || "Failed to create user profile",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message:
				"Account created successfully. Please check your email to confirm your account.",
			userId: authData.user.id,
		});
	} catch (error) {
		console.error("Signup API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred. Please try again.",
			},
			{ status: 500 }
		);
	}
}
