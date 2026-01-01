import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/app/programs/[programId]/videos
 *
 * Fetches exercises (videos) for a specific program with their details.
 * Requires an active subscription to the program.
 * Queries the program_exercises table and joins with videos.
 * Orders by display_order to maintain the intended sequence.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ programId: string }> }
) {
	try {
		// Verify authorization header
		const authHeader = request.headers.get("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Missing authorization token" },
				},
				{ status: 401 }
			);
		}

		const token = authHeader.replace("Bearer ", "");

		// Verify the user token with Supabase
		const { data: userData, error: authError } =
			await supabaseAdmin.auth.getUser(token);
		if (authError || !userData.user) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Invalid authorization token" },
				},
				{ status: 401 }
			);
		}

		const { programId: programIdParam } = await params;
		const programId = parseInt(programIdParam, 10);

		// Validate programId
		if (isNaN(programId) || programId <= 0) {
			return NextResponse.json(
				{ success: false, error: "Invalid programId parameter" },
				{ status: 400 }
			);
		}

		// Get the patient ID for this user
		const { data: user, error: userError } = await supabaseAdmin
			.from("users")
			.select("id")
			.eq("supabase_id", userData.user.id)
			.single();

		if (userError || !user) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "ValidationError", message: "User not found" },
				},
				{ status: 404 }
			);
		}

		const { data: patient, error: patientError } = await supabaseAdmin
			.from("patients")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (patientError || !patient) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "ValidationError", message: "Patient not found" },
				},
				{ status: 404 }
			);
		}

		// Check for active subscription
		const { data: subscription, error: subscriptionError } = await supabaseAdmin
			.from("exercise_program_subscriptions")
			.select("id")
			.eq("patient_id", patient.id)
			.eq("program_id", programId)
			.eq("is_active", true)
			.eq("is_cancelled", false)
			.gte("end_date", new Date().toISOString())
			.limit(1)
			.maybeSingle();

		if (subscriptionError) {
			console.error(
				"[Program Videos] Error checking subscription:",
				subscriptionError
			);
			return NextResponse.json(
				{ success: false, error: "Failed to verify subscription" },
				{ status: 500 }
			);
		}

		if (!subscription) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "SubscriptionRequired",
						message: "Active subscription required to access program videos",
					},
				},
				{ status: 403 }
			);
		}

		const { data, error } = await supabaseAdmin
			.from("program_exercises")
			.select(
				`
				volume_type,
				start_week,
				end_week,
				display_order,
				sets,
				reps,
				hold_seconds,
				notes,
				notes_ar,
				video:videos!inner(*)
			`
			)
			.eq("program_id", programId)
			.eq("video.soft_deleted", false)
			.order("start_week", { ascending: true })
			.order("display_order", { ascending: true, nullsFirst: false });

		if (error) {
			console.error("Error fetching program exercises:", error);
			return NextResponse.json(
				{ success: false, error: translateSupabaseError(error) },
				{ status: 500 }
			);
		}

		// Transform the data to flatten the video object and include exercise fields
		const videos = data?.map((item: any) => ({
			...item.video,
			volume_type: item.volume_type,
			start_week: item.start_week,
			end_week: item.end_week,
			display_order: item.display_order,
			sets: item.sets,
			reps: item.reps,
			hold_seconds: item.hold_seconds,
			notes: item.notes,
			notes_ar: item.notes_ar,
		}));

		return NextResponse.json({
			success: true,
			data: videos || [],
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("Program exercises API error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

/**
 * Helper to translate Supabase errors into user-friendly strings.
 */
function translateSupabaseError(error: any): string {
	switch (error.code) {
		case "PGRST301":
			return "No videos found for this program.";
		default:
			return error.message || "An unexpected error occurred.";
	}
}
