import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionPatient } from "@/lib/auth/get-session-patient";
import type { UpdateAddressRequest } from "@/lib/order-types";

const LOG = "[Addresses API]";

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

/**
 * The address, but only if it belongs to the signed-in buyer. Ownership is
 * checked against the session's patient, never against a `patient_id` the
 * caller supplied.
 */
async function loadOwnedAddress(
	id: string
): Promise<
	| { patientId: number; address: { id: number; is_primary: boolean } }
	| { response: NextResponse }
> {
	const session = await getSessionPatient();
	if (!session) {
		return {
			response: NextResponse.json(
				{ success: false, error: "Not signed in" },
				{ status: 401 }
			),
		};
	}

	const notFound = {
		response: NextResponse.json(
			{ success: false, error: "Address not found" },
			{ status: 404 }
		),
	};
	if (!session.patientId) return notFound;

	const { data: address, error } = await supabaseAdmin
		.from("patient_addresses")
		.select("id, is_primary")
		.eq("id", id)
		.eq("patient_id", session.patientId)
		.eq("is_deleted", false)
		.maybeSingle();

	if (error) {
		console.error(`${LOG} Error loading address:`, error.message);
		return {
			response: NextResponse.json(
				{ success: false, error: "Failed to load address" },
				{ status: 500 }
			),
		};
	}
	if (!address) return notFound;

	return { patientId: session.patientId, address };
}

/** PUT /api/addresses/[id]/ — edit one of the caller's own addresses. */
export async function PUT(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const owned = await loadOwnedAddress(id);
		if ("response" in owned) return owned.response;

		const body: UpdateAddressRequest = await request.json();

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

		if (body.is_primary && !owned.address.is_primary) {
			await supabaseAdmin
				.from("patient_addresses")
				.update({ is_primary: false })
				.eq("patient_id", owned.patientId)
				.eq("is_primary", true);
		}

		// Only the fields actually supplied are written, so a partial edit cannot
		// blank out the rest of the address.
		const updateData: Record<string, unknown> = {
			updated_at: new Date().toISOString(),
		};
		const editable = [
			"address_type",
			"address_label",
			"google_map_url",
			"latitude",
			"longitude",
			"governorate",
			"city",
			"street",
			"building_name",
			"floor",
			"apartment",
			"additional_directions",
			"phone",
			"is_primary",
		] as const;
		for (const field of editable) {
			if (body[field] !== undefined) updateData[field] = body[field];
		}

		const { data: updatedAddress, error: updateError } = await supabaseAdmin
			.from("patient_addresses")
			.update(updateData)
			.eq("id", id)
			.eq("patient_id", owned.patientId)
			.select()
			.single();

		if (updateError) {
			console.error(`${LOG} Error updating address:`, updateError.message);
			return NextResponse.json(
				{ success: false, error: "Failed to update address" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: updatedAddress });
	} catch (error) {
		console.error(`${LOG} Unexpected error:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/** DELETE /api/addresses/[id]/ — soft delete one of the caller's own addresses. */
export async function DELETE(_request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const owned = await loadOwnedAddress(id);
		if ("response" in owned) return owned.response;

		const { error: deleteError } = await supabaseAdmin
			.from("patient_addresses")
			.update({
				is_deleted: true,
				// A deleted address must not stay the primary one, or pre-fill would
				// keep reaching for a row nothing else can see.
				is_primary: false,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.eq("patient_id", owned.patientId);

		if (deleteError) {
			console.error(`${LOG} Error deleting address:`, deleteError.message);
			return NextResponse.json(
				{ success: false, error: "Failed to delete address" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`${LOG} Unexpected error:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
