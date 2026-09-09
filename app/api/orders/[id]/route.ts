import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionPatient } from "@/lib/auth/get-session-patient";

const LOG = "[Orders API]";

interface RouteContext {
	params: Promise<{
		id: string;
	}>;
}

/**
 * GET /api/orders/[id]/
 *
 * One order, and only if it belongs to the signed-in buyer. The patient comes
 * from the session; the filter used to be applied only when the caller supplied
 * a `patient_id`, so omitting it read anybody's order.
 *
 * Someone else's order answers 404, not 403: a 403 would confirm the id exists.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;

		const session = await getSessionPatient();
		if (!session) {
			return NextResponse.json(
				{ success: false, error: "Not signed in" },
				{ status: 401 }
			);
		}
		if (!session.patientId) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		const { data: order, error } = await supabaseAdmin
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
			.eq("patient_id", session.patientId)
			.eq("soft_deleted", false)
			.maybeSingle();

		if (error) {
			console.error(`${LOG} Error fetching order:`, error);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch order" },
				{ status: 500 }
			);
		}

		if (!order) {
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, data: order });
	} catch (error) {
		console.error(`${LOG} Unexpected error:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// The PATCH cancel endpoint is gone. Nothing called it, and a Shopify order can
// only be cancelled in Shopify: cancelling it here would have left the two
// systems disagreeing, with the money still taken. A cancellation performed in
// Shopify admin reaches us through the `orders/updated` webhook instead.
