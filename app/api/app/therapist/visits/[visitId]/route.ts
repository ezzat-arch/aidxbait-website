import { NextRequest, NextResponse } from "next/server";
import {
	updateVisit,
	UpdateVisitData,
} from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

interface RouteContext {
	params: Promise<{ visitId: string }>;
}

/**
 * PATCH /api/app/therapist/visits/[visitId]
 *
 * Update a visit: mark in progress / done / cancelled, or save notes.
 * Body: { supabase_id, status?, therapist_notes?, cancel_reason? }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { visitId } = await context.params;
		const body = await request.json();
		const { supabase_id, ...updateData } = body as {
			supabase_id: string;
		} & UpdateVisitData;

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}
		if (!Number(visitId)) {
			return validationError("Invalid visit id");
		}

		const allowed = ["scheduled", "in_progress", "done", "cancelled"];
		if (updateData.status && !allowed.includes(updateData.status)) {
			return validationError(`status must be one of ${allowed.join(", ")}`);
		}
		if (updateData.status === undefined && updateData.therapist_notes === undefined) {
			return validationError("No fields to update provided");
		}

		const data = await updateVisit(supabase_id, Number(visitId), updateData);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
