import { NextRequest, NextResponse } from "next/server";
import { getAreaTherapists } from "@/lib/services/app/visit-request.service";
import { visitRequestErrorResponse } from "@/lib/services/app/visit-request.errors";
import { validationError } from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/patient/therapists?locationId=<id>&specialtyId=<id?>
 *
 * Approved, available therapists covering an area — for the patient's
 * "choose a specific doctor" picker. Optional specialtyId narrows the list.
 * Returns name, specialty, gender, experience and photo for each.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const locationId = Number(searchParams.get("locationId"));
		const specialtyIdParam = searchParams.get("specialtyId");
		const specialtyId = specialtyIdParam ? Number(specialtyIdParam) : undefined;

		if (!locationId) {
			return validationError("Missing or invalid locationId query parameter");
		}
		if (specialtyIdParam && !specialtyId) {
			return validationError("Invalid specialtyId query parameter");
		}

		const data = await getAreaTherapists(locationId, specialtyId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return visitRequestErrorResponse(err);
	}
}
