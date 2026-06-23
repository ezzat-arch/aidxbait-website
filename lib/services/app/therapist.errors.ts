import { NextResponse } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import { translateSupabaseError } from "@/lib/services/app/user.service";
import {
	TherapistNotFoundError,
	NonTherapistUserError,
	TherapistNotApprovedError,
	AuthUserNotReadyError,
	EmailAlreadyRegisteredError,
	RequestNotFoundError,
	VisitNotFoundError,
} from "@/lib/services/app/therapist.service";

/**
 * Shared error -> HTTP response mapper for all therapist API routes.
 * Keeps the same { success, error: { type, message } } shape used app-wide.
 */
export function therapistErrorResponse(err: unknown) {
	if (err instanceof TherapistNotFoundError) {
		return errorJson("TherapistNotFoundError", err.message, 404);
	}
	if (err instanceof NonTherapistUserError) {
		return errorJson("NonTherapistUserError", err.message, 403);
	}
	if (err instanceof TherapistNotApprovedError) {
		return errorJson("TherapistNotApprovedError", err.message, 403);
	}
	if (err instanceof AuthUserNotReadyError) {
		return errorJson("AuthUserNotReadyError", err.message, 409);
	}
	if (err instanceof EmailAlreadyRegisteredError) {
		return errorJson("EmailAlreadyRegisteredError", err.message, 409);
	}
	if (err instanceof RequestNotFoundError) {
		return errorJson("RequestNotFoundError", err.message, 404);
	}
	if (err instanceof VisitNotFoundError) {
		return errorJson("VisitNotFoundError", err.message, 404);
	}

	const pgError = err as PostgrestError;

	// Log the full Postgres error so 500s are debuggable in the server console.
	if (pgError?.code) {
		console.error("[therapist] DB error", {
			code: pgError.code,
			message: pgError.message,
			details: pgError.details,
			hint: pgError.hint,
		});
	} else {
		console.error("[therapist] error", err);
	}

	if (pgError?.code === "23505") {
		return errorJson("DuplicateError", translateSupabaseError(pgError), 409);
	}

	const message = pgError?.code
		? translateSupabaseError(pgError)
		: (err as Error)?.message || "An unexpected error occurred";

	return errorJson("DatabaseError", message, 500);
}

export function errorJson(type: string, message: string, status: number) {
	return NextResponse.json(
		{ success: false, error: { type, message } },
		{ status }
	);
}

export function validationError(message: string) {
	return errorJson("ValidationError", message, 400);
}
