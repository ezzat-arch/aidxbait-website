import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

// GET - Fetch single order details
export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const { searchParams } = new URL(request.url);
		const patientId = searchParams.get("patient_id");

		// Build query
		let query = supabaseAdmin
			.from("orders")
			.select(
				`
				*,
				order_items (
					*,
					products (
						id,
						name,
						name_ar,
						description,
						description_ar,
						price,
						discounted_price,
						currency,
						is_for_rent,
						rent_term,
						product_images (
							id,
							image_url,
							is_main
						)
					)
				),
				shipping_address:patient_addresses!shipping_address_id (*),
				billing_address:patient_addresses!billing_address_id (*)
			`
			)
			.eq("id", id)
			.eq("soft_deleted", false);

		// Filter by patient if provided (for security)
		if (patientId) {
			query = query.eq("patient_id", patientId);
		}

		const { data: order, error } = await query.single();

		if (error || !order) {
			console.error("[Orders API] Error fetching order:", error);
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, data: order });
	} catch (error) {
		console.error("[Orders API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
