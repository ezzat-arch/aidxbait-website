import { NextRequest, NextResponse } from "next/server";
import {
	submitReview,
	getMyReviewForVisit,
	SubmitReviewData,
	ReviewVisitNotFoundError,
	VisitNotCompletedError,
	AlreadyReviewedError,
} from "@/lib/services/app/review.service";
import { visitRequestErrorResponse } from "@/lib/services/app/visit-request.errors";
import { errorJson, validationError } from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/patient/reviews?supabaseId=<uuid>&visitId=<id>
 * Returns the patient's review for that visit, or { review: null }.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");
		const visitId = Number(searchParams.get("visitId"));

		if (!supabaseId) return validationError("Missing supabaseId query parameter");
		if (!visitId) return validationError("Missing or invalid visitId");

		const review = await getMyReviewForVisit(supabaseId, visitId);
		return NextResponse.json({ success: true, data: { review } });
	} catch (err: unknown) {
		return visitRequestErrorResponse(err);
	}
}

/**
 * POST /api/app/patient/reviews
 * Body: { supabase_id, visit_id, rating (1-5), comment? }
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, ...data } = body as {
			supabase_id: string;
		} & SubmitReviewData;

		if (!supabase_id) return validationError("Missing supabase_id in request body");
		if (!data.visit_id) return validationError("Missing visit_id");
		if (
			typeof data.rating !== "number" ||
			data.rating < 1 ||
			data.rating > 5 ||
			!Number.isInteger(data.rating)
		) {
			return validationError("rating must be an integer between 1 and 5");
		}

		const review = await submitReview(supabase_id, data);
		return NextResponse.json({ success: true, data: review });
	} catch (err: unknown) {
		if (err instanceof ReviewVisitNotFoundError) {
			return errorJson("ReviewVisitNotFoundError", err.message, 404);
		}
		if (err instanceof VisitNotCompletedError) {
			return errorJson("VisitNotCompletedError", err.message, 409);
		}
		if (err instanceof AlreadyReviewedError) {
			return errorJson("AlreadyReviewedError", err.message, 409);
		}
		return visitRequestErrorResponse(err);
	}
}
