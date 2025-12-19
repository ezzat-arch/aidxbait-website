import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/app/programs/[programId]/videos
 *
 * Fetches videos for a specific program with their details.
 * Orders by sort_order to maintain the intended sequence.
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
			.from("program_videos")
			.select(
				`
				sort_order,
				video:videos!inner(*)
			`
			)
			.eq("program_id", programId)
			.eq("video.soft_deleted", false)
			.order("sort_order", { ascending: true });

		if (error) {
			console.error("Error fetching program videos:", error);
			return NextResponse.json(
				{ success: false, error: translateSupabaseError(error) },
				{ status: 500 }
			);
		}

		// Transform the data to flatten the video object and include sort_order
		const videos = data?.map((item: any) => ({
			...item.video,
			sort_order: item.sort_order,
		}));

		return NextResponse.json({
			success: true,
			data: videos || [],
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("Program videos API error:", error);
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

