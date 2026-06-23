import { NextRequest, NextResponse } from "next/server";
import { listVisits } from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/therapist/visits?supabaseId=<uuid>&status=<scheduled|in_progress|done|cancelled>
 *
 * List the therapist's visits (requests they accepted), including patient
 * card data. Omit `status` for all visits.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");
		const status = searchParams.get("status") ?? undefined;

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const allowed = ["scheduled", "in_progress", "done", "cancelled"];
		if (status && !allowed.includes(status)) {
			return validationError(`status must be one of ${allowed.join(", ")}`);
		}

		const data = await listVisits(supabaseId, status);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
