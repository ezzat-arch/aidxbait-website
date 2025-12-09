import { NextRequest, NextResponse } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import {
	getAddressesByPatientId,
	createAddress,
	translateSupabaseError,
	CreateAddressData,
} from "@/lib/services/app/address.service";

interface RouteContext {
	params: Promise<{ patientId: string }>;
}

/**
 * GET /api/app/patient/[patientId]/addresses
 *
 * Fetch all addresses for a patient
 *
 * Success: { success: true, data: Address[] }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const { patientId } = await context.params;
		const patientIdNum = parseInt(patientId, 10);

		if (isNaN(patientIdNum)) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Invalid patient ID",
					},
				},
				{ status: 400 }
			);
		}

		const addresses = await getAddressesByPatientId(patientIdNum);

		return NextResponse.json({
			success: true,
			data: addresses,
		});
	} catch (err: unknown) {
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

/**
 * POST /api/app/patient/[patientId]/addresses
 *
 * Create a new address for a patient
 * Body: CreateAddressData
 *
 * Success: { success: true, data: Address }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function POST(request: NextRequest, context: RouteContext) {
	try {
		const { patientId } = await context.params;
		const patientIdNum = parseInt(patientId, 10);

		if (isNaN(patientIdNum)) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Invalid patient ID",
					},
				},
				{ status: 400 }
			);
		}

		const body = (await request.json()) as CreateAddressData;

		// Validate required fields
		const requiredFields = [
			"address_type",
			"address_label",
			"governorate",
			"city",
			"street",
		];
		const missingFields = requiredFields.filter(
			(field) => !body[field as keyof CreateAddressData]
		);

		if (missingFields.length > 0) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: `Missing required fields: ${missingFields.join(", ")}`,
					},
				},
				{ status: 400 }
			);
		}

		// Validate address_type
		if (!["House", "Apartment"].includes(body.address_type)) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: 'address_type must be "House" or "Apartment"',
					},
				},
				{ status: 400 }
			);
		}

		// Ensure patient_id matches the URL parameter
		const addressData: CreateAddressData = {
			...body,
			patient_id: patientIdNum,
		};

		const address = await createAddress(addressData);

		return NextResponse.json(
			{
				success: true,
				data: address,
			},
			{ status: 201 }
		);
	} catch (err: unknown) {
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
