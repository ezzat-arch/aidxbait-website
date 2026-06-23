import { NextRequest, NextResponse } from "next/server";
import {
	signUpTherapist,
	SignUpTherapistData,
} from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * POST /api/app/therapist/signup
 *
 * Server-side therapist signup (mirrors the patient /api/app/auth/signup):
 * creates an auto-confirmed Supabase Auth user, the users + therapists rows,
 * and returns a ready-to-use session. No email confirmation / OTP needed.
 *
 * Body: { email, password, first_name, last_name, phone_number }
 *
 * Success: { success: true, data: { session, profile } }
 * Error:   { success: false, error: { type, message } }
 */
export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as SignUpTherapistData;

		const requiredFields: (keyof SignUpTherapistData)[] = [
			"email",
			"password",
			"first_name",
			"last_name",
			"phone_number",
		];
		const missingFields = requiredFields.filter((field) => !body[field]);

		// Optional professional fields are passed straight through to the service.

		if (missingFields.length > 0) {
			return validationError(
				`Missing required fields: ${missingFields.join(", ")}`
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.email)) {
			return validationError("Invalid email format");
		}

		if (body.password.length < 8) {
			return validationError("Password must be at least 8 characters long");
		}

		const data = await signUpTherapist(body);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
