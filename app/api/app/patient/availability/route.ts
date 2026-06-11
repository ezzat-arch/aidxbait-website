import { NextRequest, NextResponse } from "next/server";
import { getAreaAvailability } from "@/lib/services/app/visit-request.service";
import { visitRequestErrorResponse } from "@/lib/services/app/visit-request.errors";
import { validationError } from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/patient/availability?locationId=<id>&days=<n>&therapistId=<id>
 *
 * For an area, which of the next N days (default 14, max 30) have at least
 * one approved therapist free, per time slot. Drives the patient's date/slot
 * picker so they only book days a doctor actually works.
 *
 * Optional `therapistId` narrows availability to ONE specific doctor
 * (used when the patient chooses a doctor instead of a general request).
 *
 * Success: { success: true, data: { therapist_count, days: [{date, day_of_week, slots}] } }
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const locationId = Number(searchParams.get("locationId"));
		const days = Math.min(Number(searchParams.get("days")) || 14, 30);
		const therapistIdParam = searchParams.get("therapistId");
		const therapistId = therapistIdParam ? Number(therapistIdParam) : undefined;

		if (!locationId) {
			return validationError("Missing or invalid locationId query parameter");
		}
		if (therapistIdParam && !therapistId) {
			return validationError("Invalid therapistId query parameter");
		}

		const data = await getAreaAvailability(locationId, days, therapistId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return visitRequestErrorResponse(err);
	}
}
