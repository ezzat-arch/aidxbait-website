import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UpdateAddressRequest } from "@/lib/order-types";

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

// PUT - Update address
export async function PUT(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const body: UpdateAddressRequest & { patient_id: number } =
			await request.json();

		if (!body.patient_id) {
			return NextResponse.json(
				{ success: false, error: "Patient ID is required" },
				{ status: 400 }
			);
		}

		// Verify the address belongs to the patient
		const { data: existingAddress, error: fetchError } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("id", id)
			.eq("patient_id", body.patient_id)
			.eq("is_deleted", false)
			.single();

		if (fetchError || !existingAddress) {
			return NextResponse.json(
				{ success: false, error: "Address not found" },
				{ status: 404 }
			);
		}

		// Validate address_type if provided
		if (
			body.address_type &&
			!["House", "Apartment"].includes(body.address_type)
		) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid address_type. Must be 'House' or 'Apartment'",
				},
				{ status: 400 }
			);
		}

		// If this is being set as primary, unset any existing primary address
		if (body.is_primary && !existingAddress.is_primary) {
			await supabaseAdmin
				.from("patient_addresses")
				.update({ is_primary: false })
				.eq("patient_id", body.patient_id)
				.eq("is_primary", true);
		}

		// Prepare update data (only include fields that are provided)
		const updateData: any = {
			updated_at: new Date().toISOString(),
		};

		if (body.address_type !== undefined)
			updateData.address_type = body.address_type;
		if (body.address_label !== undefined)
			updateData.address_label = body.address_label;
		if (body.google_map_url !== undefined)
			updateData.google_map_url = body.google_map_url;
		if (body.latitude !== undefined) updateData.latitude = body.latitude;
		if (body.longitude !== undefined) updateData.longitude = body.longitude;
		if (body.governorate !== undefined)
			updateData.governorate = body.governorate;
		if (body.city !== undefined) updateData.city = body.city;
		if (body.street !== undefined) updateData.street = body.street;
		if (body.building_name !== undefined)
			updateData.building_name = body.building_name;
		if (body.floor !== undefined) updateData.floor = body.floor;
		if (body.apartment !== undefined) updateData.apartment = body.apartment;
		if (body.additional_directions !== undefined)
			updateData.additional_directions = body.additional_directions;
		if (body.phone !== undefined) updateData.phone = body.phone;
		if (body.is_primary !== undefined) updateData.is_primary = body.is_primary;

		// Update the address
		const { data: updatedAddress, error: updateError } = await supabaseAdmin
			.from("patient_addresses")
			.update(updateData)
			.eq("id", id)
			.eq("patient_id", body.patient_id)
			.select()
			.single();

		if (updateError) {
			console.error("[Addresses API] Error updating address:", updateError);
			return NextResponse.json(
				{ success: false, error: "Failed to update address" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: updatedAddress });
	} catch (error) {
		console.error("[Addresses API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// DELETE - Soft delete address
export async function DELETE(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const { searchParams } = new URL(request.url);
		const patientId = searchParams.get("patient_id");

		if (!patientId) {
			return NextResponse.json(
				{ success: false, error: "Patient ID is required" },
				{ status: 400 }
			);
		}

		// Verify the address belongs to the patient
		const { data: existingAddress, error: fetchError } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("id", id)
			.eq("patient_id", patientId)
			.eq("is_deleted", false)
			.single();

		if (fetchError || !existingAddress) {
			return NextResponse.json(
				{ success: false, error: "Address not found" },
				{ status: 404 }
			);
		}

		// Soft delete the address
		const { error: deleteError } = await supabaseAdmin
			.from("patient_addresses")
			.update({
				is_deleted: true,
				is_primary: false, // Remove primary status when deleting
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.eq("patient_id", patientId);

		if (deleteError) {
			console.error("[Addresses API] Error deleting address:", deleteError);
			return NextResponse.json(
				{ success: false, error: "Failed to delete address" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Addresses API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
