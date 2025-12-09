import { NextRequest, NextResponse } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import {
	setPrimaryAddress,
	translateSupabaseError,
	AddressNotFoundError,
	AddressAccessDeniedError,
} from "@/lib/services/app/address.service";

interface RouteContext {
	params: Promise<{ patientId: string; addressId: string }>;
}

/**
 * PUT /api/app/patient/[patientId]/addresses/[addressId]/set-primary
 *
 * Set an address as the primary address for a patient
 *
 * Success: { success: true, data: Address }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
	try {
		const { patientId, addressId } = await context.params;
		const patientIdNum = parseInt(patientId, 10);
		const addressIdNum = parseInt(addressId, 10);

		if (isNaN(patientIdNum) || isNaN(addressIdNum)) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Invalid patient ID or address ID",
					},
				},
				{ status: 400 }
			);
		}

		const address = await setPrimaryAddress(patientIdNum, addressIdNum);

		return NextResponse.json({
			success: true,
			data: address,
		});
	} catch (err: unknown) {
		if (err instanceof AddressNotFoundError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "AddressNotFoundError",
						message: err.message,
					},
				},
				{ status: 404 }
			);
		}

		if (err instanceof AddressAccessDeniedError) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "AddressAccessDeniedError",
						message: err.message,
					},
				},
				{ status: 403 }
			);
		}

		const error = err as PostgrestError;
		const message = error?.code
			? translateSupabaseError(error)
			: (err as Error)?.message || "An unexpected error occurred";

		return NextResponse.json(
			{
				success: false,
				error: {
					type: "DatabaseError",
					message,
				},
			},
			{ status: 500 }
		);
	}
}
