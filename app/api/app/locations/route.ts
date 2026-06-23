import { NextResponse } from "next/server";
import { listLocations } from "@/lib/services/app/therapist.service";
import { therapistErrorResponse } from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/locations
 *
 * Public lookup of service areas, used by the therapist app for the
 * "areas covered" picker.
 */
export async function GET() {
	try {
		const data = await listLocations();
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
