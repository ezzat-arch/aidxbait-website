import { NextRequest, NextResponse } from "next/server";
import { respondToRequest } from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

interface RouteContext {
	params: Promise<{ requestId: string }>;
}

/**
 * POST /api/app/therapist/requests/[requestId]/respond
 *
 * Accept or decline a patient request.
 * Body: { supabase_id, action: "accept" | "decline" }
 *
 * Accepting creates a `visits` row (status: scheduled). If another
 * therapist accepted first, returns 404 RequestNotFoundError.
 */
export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const { requestId } = await context.params;
		const body = await request.json();
		const { supabase_id, action } = body as {
			supabase_id: string;
			action: "accept" | "decline";
		};

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}
		if (!Number(requestId)) {
			return validationError("Invalid request id");
		}
		if (action !== "accept" && action !== "decline") {
			return validationError('action must be "accept" or "decline"');
		}

		const data = await respondToRequest(supabase_id, Number(requestId), action);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
