import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionPatient } from "@/lib/auth/get-session-patient";
import { claimGuestOrders } from "@/lib/orders/claim-guest-orders";

const LOG = "[Orders API]";

/**
 * The order shape My Orders renders. `products` comes back null for Shopify
 * lines (they have no `product_id`), which is what the snapshot columns on
 * `order_items` are for.
 */
const ORDER_SELECT = `
	*,
	order_items (
		*,
		products (
			id,
			name,
			name_ar,
			description,
			description_ar,
			is_for_rent,
			product_images (
				id,
				image_url,
				is_main
			)
		)
	),
	shipping_address:patient_addresses!shipping_address_id (*),
	billing_address:patient_addresses!billing_address_id (*)
`;

/**
 * GET /api/orders/
 *
 * The signed-in buyer's own orders. The patient is derived from the session
 * cookie; a `patient_id` in the query string is ignored. It used to be trusted,
 * which let anyone read anyone's orders by guessing an id.
 *
 *   401 — no session
 *   200 — `[]` when the account has no patient record (a therapist or admin
 *         has no orders; that is not an error)
 */
export async function GET(request: NextRequest) {
	try {
		const session = await getSessionPatient();
		if (!session) {
			return NextResponse.json(
				{ success: false, error: "Not signed in" },
				{ status: 401 }
			);
		}

		if (!session.patientId) {
			return NextResponse.json({ success: true, data: [], count: 0 });
		}

		// Anything bought as a guest with this email joins the account here. One
		// indexed query returning nothing, in the common case.
		await claimGuestOrders(session.email, session.patientId);

		const { searchParams } = new URL(request.url);

		let query = supabaseAdmin
			.from("orders")
			.select(ORDER_SELECT)
			.eq("patient_id", session.patientId)
			.eq("soft_deleted", false);

		const orderStatus = searchParams.get("order_status");
		if (orderStatus) query = query.eq("order_status", orderStatus);

		const paymentStatus = searchParams.get("payment_status");
		if (paymentStatus) query = query.eq("payment_status", paymentStatus);

		const orderType = searchParams.get("order_type");
		if (orderType) query = query.eq("order_type", orderType);

		const fromDate = searchParams.get("from_date");
		if (fromDate) query = query.gte("order_date", fromDate);

		const toDate = searchParams.get("to_date");
		if (toDate) query = query.lte("order_date", toDate);

		const limit = parseInt(searchParams.get("limit") || "50");
		const offset = parseInt(searchParams.get("offset") || "0");

		query = query
			.order("order_date", { ascending: false })
			.range(offset, offset + limit - 1);

		const { data: orders, error, count } = await query;

		if (error) {
			console.error(`${LOG} Error fetching orders:`, error);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch orders" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: orders,
			count: count || orders?.length || 0,
		});
	} catch (error) {
		console.error(`${LOG} Unexpected error:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// There is deliberately no POST here any more. Website orders are created by
// Shopify and arrive through `app/api/shopify/webhooks/orders/`; the mobile app
// writes its own orders directly. The old POST built an order out of the
// Supabase catalog for the store checkout page that Phase 2 removed.
