import { NextRequest, NextResponse } from "next/server";
import { getRequestDetails } from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

interface RouteContext {
	params: Promise<{ requestId: string }>;
}

/**
 * GET /api/app/therapist/requests/[requestId]?supabaseId=<uuid>
 *
 * Full patient card for a single request: patient demographics, complaint,
 * pain areas (body map), notes, attached documents and visit location.
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

		const data = await getRequestDetails(supabaseId, Number(requestId));
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
