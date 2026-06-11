import { NextRequest, NextResponse } from "next/server";
import {
	createVisitRequest,
	listMyRequests,
	CreateVisitRequestData,
} from "@/lib/services/app/visit-request.service";
import { TIME_SLOTS } from "@/lib/services/app/therapist.service";
import { visitRequestErrorResponse } from "@/lib/services/app/visit-request.errors";
import { validationError } from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/patient/requests?supabaseId=<uuid>
 *
 * The patient's home-visit requests, newest first. Each row carries
 * `display_status`: pending | scheduled | in_progress | done | cancelled,
 * and, once accepted, the assigned therapist's name/phone/specialty.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const data = await listMyRequests(supabaseId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return visitRequestErrorResponse(err);
	}
}

/**
 * POST /api/app/patient/requests
 *
 * Create a home-visit request. It becomes visible immediately to approved
 * therapists covering the area (no admin review step).
 *
 * Body: {
 *   supabase_id, location_id, request_date 'YYYY-MM-DD',
 *   time_slot ('8:00-12:00'|'12:00-16:00'|'16:00-20:00'),
 *   gender ('Male'|'Female')  — preferred therapist gender,
 *   complaint?, pain_areas?: string[], notes?
 * }
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, ...data } = body as {
			supabase_id: string;
		} & CreateVisitRequestData;

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}
		if (!data.location_id) {
			return validationError("Missing location_id");
		}
		if (!data.request_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.request_date)) {
			return validationError("Invalid request_date, expected YYYY-MM-DD");
		}
		const today = new Date().toISOString().slice(0, 10);
		if (data.request_date < today) {
			return validationError("request_date cannot be in the past");
		}
		if (!TIME_SLOTS.includes(data.time_slot)) {
			return validationError(
				`Invalid time_slot, expected one of ${TIME_SLOTS.join(", ")}`
			);
		}
		if (data.gender !== "Male" && data.gender !== "Female") {
			return validationError('gender must be "Male" or "Female"');
		}
		if (
			data.pain_areas !== undefined &&
			(!Array.isArray(data.pain_areas) ||
				data.pain_areas.some((p) => typeof p !== "string"))
		) {
			return validationError("pain_areas must be an array of strings");
		}
		if (
			data.preferred_therapist_id !== undefined &&
			data.preferred_therapist_id !== null &&
			!Number(data.preferred_therapist_id)
		) {
			return validationError("preferred_therapist_id must be a therapist id");
		}

		const created = await createVisitRequest(supabase_id, data);
		return NextResponse.json({ success: true, data: created });
	} catch (err: unknown) {
		return visitRequestErrorResponse(err);
	}
}
