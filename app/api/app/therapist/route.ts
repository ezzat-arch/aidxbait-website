import { NextRequest, NextResponse } from "next/server";
import {
	getTherapistBySupabaseId,
	createTherapist,
	updateTherapist,
	CreateTherapistData,
	UpdateTherapistData,
} from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/therapist?supabaseId=<uuid>
 *
 * Fetch the therapist profile (account status, specialty, areas covered...).
 * The app uses `account_status` to route the user:
 *   pending_documents -> document upload flow
 *   pending_review    -> waiting screen
 *   approved          -> main tabs
 *   rejected          -> rejection screen with reason
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const data = await getTherapistBySupabaseId(supabaseId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}

/**
 * POST /api/app/therapist
 *
 * Create a therapist account after Supabase Auth signup.
 * Body: { supabase_id, first_name, last_name, email, phone_number, image_url? }
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as CreateTherapistData;

		const requiredFields = [
			"supabase_id",
			"first_name",
			"last_name",
			"email",
			"phone_number",
		];
		const missingFields = requiredFields.filter(
			(field) => !body[field as keyof CreateTherapistData]
		);

		if (missingFields.length > 0) {
			return validationError(
				`Missing required fields: ${missingFields.join(", ")}`
			);
		}

		const result = await createTherapist(body);
		return NextResponse.json({ success: true, data: result });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}

/**
 * PATCH /api/app/therapist
 *
 * Update therapist profile.
 * Body: { supabase_id, specialty?, bio?, gender?, experience_years?,
 *         is_available?, location_ids?, first_name?, last_name?,
 *         image_url?, submit_for_review? }
 */
export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, ...updateData } = body as {
			supabase_id: string;
		} & UpdateTherapistData;

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}

		const data = await updateTherapist(supabase_id, updateData);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
