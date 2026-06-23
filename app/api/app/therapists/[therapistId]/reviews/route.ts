import { NextRequest, NextResponse } from "next/server";
import { getTherapistReviews } from "@/lib/services/app/review.service";
import { therapistErrorResponse, validationError } from "@/lib/services/app/therapist.errors";

interface RouteContext {
	params: Promise<{ therapistId: string }>;
}

/**
 * GET /api/app/therapists/[therapistId]/reviews
 *
 * A therapist's rating aggregate + recent reviews (rating, comment, date —
 * no reviewer identity). Used by the patient app's "doctor reviews" view.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
	try {
		const { therapistId } = await context.params;
		if (!Number(therapistId)) {
			return validationError("Invalid therapist id");
		}

		const data = await getTherapistReviews(Number(therapistId));
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
