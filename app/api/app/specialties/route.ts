import { NextResponse } from "next/server";
import { listActiveSpecialties } from "@/lib/services/app/therapist.service";
import { therapistErrorResponse } from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/specialties
 *
 * Public list of active specialties (id, name, name_ar). Used by the
 * therapist app (signup/profile specialty picker) and the patient app
 * (request specialty filter).
 */
export async function GET() {
	try {
		const data = await listActiveSpecialties();
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
