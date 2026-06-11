import { NextRequest, NextResponse } from "next/server";
import { cancelVisitRequest } from "@/lib/services/app/visit-request.service";
import { visitRequestErrorResponse } from "@/lib/services/app/visit-request.errors";
import { validationError } from "@/lib/services/app/therapist.errors";

interface RouteContext {
	params: Promise<{ requestId: string }>;
}

/**
 * DELETE /api/app/patient/requests/[requestId]?supabaseId=<uuid>
 *
 * Cancel a home-visit request. Allowed while pending or still 'scheduled';
 * archives the request and cancels the scheduled visit so the therapist's
 * upcoming list stays consistent.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
	try {
		const { requestId } = await context.params;
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}
		if (!Number(requestId)) {
			return validationError("Invalid request id");
		}

		await cancelVisitRequest(supabaseId, Number(requestId));
		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		return visitRequestErrorResponse(err);
	}
}
