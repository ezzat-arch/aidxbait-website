import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/app/programs
 *
 * Fetches programs with their related joint information and aggregated review data.
 * Excludes soft-deleted programs.
 *
 * Query params:
 * - jointId: Optional joint ID to filter programs by specific joint
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const jointIdParam = searchParams.get("jointId");
		const jointId = jointIdParam ? parseInt(jointIdParam, 10) : undefined;

		// Validate jointId if provided
		if (jointIdParam && (isNaN(jointId!) || jointId! <= 0)) {
			return NextResponse.json(
				{ success: false, error: "Invalid jointId parameter" },
				{ status: 400 }
			);
		}

		let query = supabaseAdmin
			.from("programs")
			.select(
				`
				*,
				joint:program_joint_names!inner(id, name, name_ar),
				program_reviews(rating),
				program_exercises(id)
			`
			)
			.eq("soft_deleted", false);

		// Add joint filter if specified
		if (jointId) {
			query = query.eq("joint_id", jointId);
		}

		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) {
			console.error("Error fetching programs:", error);
			return NextResponse.json(
				{ success: false, error: translateSupabaseError(error) },
				{ status: 500 }
			);
		}

		// Transform the data to include aggregated review statistics
		const programsWithStats = data?.map((program: any) => {
			const reviews = program.program_reviews || [];
			const exercises = program.program_exercises || [];

			const totalRating = reviews.reduce(
				(sum: number, review: any) => sum + review.rating,
				0
			);
			const averageRating =
				reviews.length > 0 ? totalRating / reviews.length : 0;

			return {
				...program,
				average_rating: Number(averageRating.toFixed(1)),
				review_count: reviews.length,
				video_count: exercises.length,
				// Remove the raw arrays to clean up the response
				program_reviews: undefined,
				program_exercises: undefined,
			};
		});

		return NextResponse.json({
			success: true,
			data: programsWithStats || [],
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("Programs API error:", error);
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
			return "No programs found.";
		default:
			return error.message || "An unexpected error occurred.";
	}
}

