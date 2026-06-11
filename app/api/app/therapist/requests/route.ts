import { NextRequest, NextResponse } from "next/server";
import { listIncomingRequests } from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/therapist/requests?supabaseId=<uuid>
 *
 * List open patient home-visit requests in the therapist's covered areas.
 * Only approved therapists can see requests. Requests already taken by
 * another therapist or declined by this therapist are excluded.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const data = await listIncomingRequests(supabaseId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
