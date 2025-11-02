import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
	CreateAddressRequest,
	AddressesResponse,
	AddressResponse,
} from "@/lib/order-types";

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

// GET - Fetch patient addresses
export async function GET(request: NextRequest) {
	const startTime = Date.now();
	
	try {
		const { searchParams } = new URL(request.url);
		const patientId = searchParams.get("patient_id");

		console.log("[ADDRESS-API-DEBUG] GET request received:", {
			patientId,
			timestamp: new Date().toISOString(),
		});

		if (!patientId) {
			console.log("[ADDRESS-API-DEBUG] Request rejected - missing patient_id");
			return NextResponse.json(
				{ success: false, error: "Patient ID is required" },
				{ status: 400 }
			);
		}

		console.log("[ADDRESS-API-DEBUG] Querying database for addresses...");
		const queryStartTime = Date.now();
		
		const { data: addresses, error } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("patient_id", patientId)
			.eq("is_deleted", false)
			.order("is_primary", { ascending: false })
			.order("created_at", { ascending: false });

		const queryDuration = Date.now() - queryStartTime;
		
		if (error) {
			console.error("[ADDRESS-API-DEBUG] Database query error:", {
				error: error.message,
				code: error.code,
				details: error.details,
				hint: error.hint,
				patientId,
				queryDurationMs: queryDuration,
				timestamp: new Date().toISOString(),
			});
			return NextResponse.json(
				{ success: false, error: "Failed to fetch addresses" },
				{ status: 500 }
			);
		}

		const totalDuration = Date.now() - startTime;
		console.log("[ADDRESS-API-DEBUG] Request completed successfully:", {
			addressCount: addresses?.length || 0,
			queryDurationMs: queryDuration,
			totalDurationMs: totalDuration,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json({ success: true, data: addresses });
	} catch (error) {
		const totalDuration = Date.now() - startTime;
		console.error("[ADDRESS-API-DEBUG] Unexpected error:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			totalDurationMs: totalDuration,
			timestamp: new Date().toISOString(),
		});
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST - Create new patient address
export async function POST(request: NextRequest) {
	try {
		const body: CreateAddressRequest = await request.json();

		// Validate required fields
		if (
			!body.patient_id ||
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
						"Missing required fields: patient_id, address_type, address_label, governorate, city, street",
				},
				{ status: 400 }
			);
		}

		// Validate address_type
		if (!["House", "Apartment"].includes(body.address_type)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid address_type. Must be 'House' or 'Apartment'",
				},
				{ status: 400 }
			);
		}

		// If this is being set as primary, unset any existing primary address
		if (body.is_primary) {
			await supabaseAdmin
				.from("patient_addresses")
				.update({ is_primary: false })
				.eq("patient_id", body.patient_id)
				.eq("is_primary", true);
		}

		// Insert the new address
		const { data: newAddress, error } = await supabaseAdmin
			.from("patient_addresses")
			.insert({
				patient_id: body.patient_id,
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
			console.error("[Addresses API] Error creating address:", error);
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
		console.error("[Addresses API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
