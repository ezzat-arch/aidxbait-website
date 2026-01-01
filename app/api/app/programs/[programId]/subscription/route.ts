import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
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
 * GET /api/app/programs/[programId]/subscription
 *
 * Check if the authenticated user has an active subscription to the specified program.
 * Returns subscription status and details if subscribed.
 * For unauthenticated users, returns is_subscribed: false (they can't be subscribed).
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ programId: string }> }
) {
	try {
		const { programId: programIdParam } = await params;
		const programId = parseInt(programIdParam, 10);

		// Validate programId
		if (isNaN(programId) || programId <= 0) {
			return NextResponse.json(
				{ success: false, error: "Invalid programId parameter" },
				{ status: 400 }
			);
		}

		// Check authorization header - if not present or invalid, user is not subscribed
		const authHeader = request.headers.get("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			// No auth token = not logged in = not subscribed
			return NextResponse.json({
				success: true,
				data: {
					is_subscribed: false,
					subscription: null,
				},
			});
		}

		const token = authHeader.replace("Bearer ", "");

		// If token is empty, user is not logged in
		if (!token) {
			return NextResponse.json({
				success: true,
				data: {
					is_subscribed: false,
					subscription: null,
				},
			});
		}

		// Verify the user token with Supabase
		const { data: userData, error: authError } =
			await supabaseAdmin.auth.getUser(token);
		if (authError || !userData.user) {
			// Invalid token = not logged in = not subscribed
			return NextResponse.json({
				success: true,
				data: {
					is_subscribed: false,
					subscription: null,
				},
			});
		}

		// Get the patient ID for this user
		const { data: user, error: userError } = await supabaseAdmin
			.from("users")
			.select("id")
			.eq("supabase_id", userData.user.id)
			.single();

		if (userError || !user) {
			// User not found in DB = not subscribed
			return NextResponse.json({
				success: true,
				data: {
					is_subscribed: false,
					subscription: null,
				},
			});
		}

		const { data: patient, error: patientError } = await supabaseAdmin
			.from("patients")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (patientError || !patient) {
			// Patient not found = not subscribed
			return NextResponse.json({
				success: true,
				data: {
					is_subscribed: false,
					subscription: null,
				},
			});
		}

		// Check for active subscription
		const { data: subscription, error: subscriptionError } = await supabaseAdmin
			.from("exercise_program_subscriptions")
			.select("id, is_active, start_date, end_date, created_at")
			.eq("patient_id", patient.id)
			.eq("program_id", programId)
			.eq("is_active", true)
			.eq("is_cancelled", false)
			.gte("end_date", new Date().toISOString())
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (subscriptionError) {
			console.error(
				"[Subscription Check] Error checking subscription:",
				subscriptionError
			);
			return NextResponse.json(
				{ success: false, error: "Failed to check subscription status" },
				{ status: 500 }
			);
		}

		const isSubscribed = !!subscription;

		return NextResponse.json({
			success: true,
			data: {
				is_subscribed: isSubscribed,
				subscription: isSubscribed
					? {
							id: subscription.id,
							start_date: subscription.start_date,
							end_date: subscription.end_date,
					  }
					: null,
			},
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("[Subscription Check] Error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

