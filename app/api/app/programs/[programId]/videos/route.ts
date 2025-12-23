import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/app/programs/[programId]/videos
 *
 * Fetches exercises (videos) for a specific program with their details.
 * Queries the program_exercises table and joins with videos.
 * Orders by display_order to maintain the intended sequence.
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
