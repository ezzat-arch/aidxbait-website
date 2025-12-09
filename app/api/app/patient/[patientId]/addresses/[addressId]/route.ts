import { NextRequest, NextResponse } from "next/server";
import { PostgrestError } from "@supabase/supabase-js";
import {
	getAddressById,
	updateAddress,
	deleteAddress,
	translateSupabaseError,
	AddressNotFoundError,
	AddressAccessDeniedError,
	UpdateAddressData,
} from "@/lib/services/app/address.service";

interface RouteContext {
	params: Promise<{ patientId: string; addressId: string }>;
}

/**
 * GET /api/app/patient/[patientId]/addresses/[addressId]
 *
 * Fetch a single address by ID
 *
 * Success: { success: true, data: Address }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

		const address = await getAddressById(patientIdNum, addressIdNum);

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

/**
 * PUT /api/app/patient/[patientId]/addresses/[addressId]
 *
 * Update an existing address
 * Body: UpdateAddressData
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

		const body = (await request.json()) as UpdateAddressData;

		// Validate address_type if provided
		if (
			body.address_type &&
			!["House", "Apartment"].includes(body.address_type)
		) {
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

		const address = await updateAddress(patientIdNum, addressIdNum, body);

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

/**
 * DELETE /api/app/patient/[patientId]/addresses/[addressId]
 *
 * Soft delete an address
 *
 * Success: { success: true, data: { deleted: true } }
 * Error: { success: false, error: { type: string, message: string } }
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
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

		await deleteAddress(patientIdNum, addressIdNum);

		return NextResponse.json({
			success: true,
			data: { deleted: true },
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
