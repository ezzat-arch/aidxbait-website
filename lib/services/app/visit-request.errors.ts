import { PostgrestError } from "@supabase/supabase-js";
import {
	UserNotFoundError,
	NonPatientUserError,
	MissingPatientRecordError,
	translateSupabaseError,
} from "@/lib/services/app/user.service";
import {
	VisitRequestNotFoundError,
	RequestNotCancellableError,
	NoTherapistsInAreaError,
	TherapistNotInAreaError,
} from "@/lib/services/app/visit-request.service";
import { errorJson } from "@/lib/services/app/therapist.errors";

/**
 * Error -> HTTP response mapper for the patient visit-request routes.
 * Same { success, error: { type, message } } envelope as the rest of the app API.
 */
export function visitRequestErrorResponse(err: unknown) {
	if (err instanceof UserNotFoundError) {
		return errorJson("UserNotFoundError", err.message, 404);
	}
	if (err instanceof NonPatientUserError) {
		return errorJson("NonPatientUserError", err.message, 403);
	}
	if (err instanceof MissingPatientRecordError) {
		return errorJson("MissingPatientRecordError", err.message, 422);
	}
	if (err instanceof VisitRequestNotFoundError) {
		return errorJson("VisitRequestNotFoundError", err.message, 404);
	}
	if (err instanceof RequestNotCancellableError) {
		return errorJson("RequestNotCancellableError", err.message, 409);
	}
	if (err instanceof NoTherapistsInAreaError) {
		return errorJson("NoTherapistsInAreaError", err.message, 422);
	}
	if (err instanceof TherapistNotInAreaError) {
		return errorJson("TherapistNotInAreaError", err.message, 422);
	}

	const pgError = err as PostgrestError;
	if (pgError?.code) {
		console.error("[visit-request] DB error", {
			code: pgError.code,
			message: pgError.message,
			details: pgError.details,
		});
	} else {
		console.error("[visit-request] error", err);
	}

	const message = pgError?.code
		? translateSupabaseError(pgError)
		: (err as Error)?.message || "An unexpected error occurred";

	return errorJson("DatabaseError", message, 500);
}
