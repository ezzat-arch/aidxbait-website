import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionPatient } from "@/lib/auth/get-session-patient";
import type { CreateAddressRequest } from "@/lib/order-types";

const LOG = "[Addresses API]";

/**
 * The signed-in buyer's patient id, or a ready-made error response.
 *
 * Every handler in this file derives the patient from the session cookie. A
 * `patient_id` in the request body or query string is ignored: it used to be
 * trusted, which let any caller read and write any patient's address book.
 */
async function requirePatient(): Promise<
	{ patientId: number } | { response: NextResponse }
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
	if (!session.patientId) {
		return {
			response: NextResponse.json(
				{ success: false, error: "This account has no patient profile" },
				{ status: 403 }
			),
		};
	}
	return { patientId: session.patientId };
}

/** GET /api/addresses/ — the caller's own addresses, primary first. */
export async function GET(_request: NextRequest) {
	try {
		const auth = await requirePatient();
		if ("response" in auth) return auth.response;

		const { data: addresses, error } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("patient_id", auth.patientId)
			.eq("is_deleted", false)
			.order("is_primary", { ascending: false })
			.order("created_at", { ascending: false });

		if (error) {
			console.error(`${LOG} Error fetching addresses:`, error.message);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch addresses" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: addresses });
	} catch (error) {
		console.error(`${LOG} Unexpected error:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

/** POST /api/addresses/ — add an address to the caller's own address book. */
export async function POST(request: NextRequest) {
	try {
		const auth = await requirePatient();
		if ("response" in auth) return auth.response;

		const body: CreateAddressRequest = await request.json();

		if (
			!body.address_type ||
			!body.address_label ||
			!body.governorate ||
			!body.city ||
			!body.street
		) {
			return NextResponse.json(
				{
					success: false,
					error:
						"Missing required fields: address_type, address_label, governorate, city, street",
				},
				{ status: 400 }
			);
		}

		if (!["House", "Apartment"].includes(body.address_type)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid address_type. Must be 'House' or 'Apartment'",
				},
				{ status: 400 }
			);
		}

		// Only one address can be primary, so demote the current one first.
		if (body.is_primary) {
			await supabaseAdmin
				.from("patient_addresses")
				.update({ is_primary: false })
				.eq("patient_id", auth.patientId)
				.eq("is_primary", true);
		}

		const { data: newAddress, error } = await supabaseAdmin
			.from("patient_addresses")
			.insert({
				patient_id: auth.patientId,
				address_type: body.address_type,
				address_label: body.address_label,
				google_map_url: body.google_map_url || null,
				latitude: body.latitude || null,
				longitude: body.longitude || null,
				governorate: body.governorate,
				city: body.city,
				street: body.street,
				building_name: body.building_name || null,
				floor: body.floor || null,
				apartment: body.apartment || null,
				additional_directions: body.additional_directions || null,
				phone: body.phone || null,
				is_primary: body.is_primary || false,
			})
			.select()
			.single();

		if (error) {
			console.error(`${LOG} Error creating address:`, error.message);
			return NextResponse.json(
				{ success: false, error: "Failed to create address" },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ success: true, data: newAddress },
			{ status: 201 }
		);
	} catch (error) {
		console.error(`${LOG} Unexpected error:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
