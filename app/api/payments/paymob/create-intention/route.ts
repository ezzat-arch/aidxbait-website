import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
	authenticatePaymob,
	createPaymobOrder,
	generatePaymentKey,
	getPaymobPaymentUrl,
	type PaymobOrderItem,
	type PaymobBillingData,
} from "@/lib/paymob/paymob-service";

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

export async function POST(request: NextRequest) {
	try {
		const { order_id } = await request.json();

		if (!order_id) {
			return NextResponse.json(
				{ success: false, error: "Order ID is required" },
				{ status: 400 }
			);
		}

		// Fetch order details with items and shipping address
		const { data: order, error: orderError } = await supabaseAdmin
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
						description
					)
				),
				shipping_address:patient_addresses!shipping_address_id (*)
			`
			)
			.eq("id", order_id)
			.single();

		if (orderError || !order) {
			console.error("[Paymob Intention] Order fetch error:", orderError);
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

	// Validate order status
	if (order.payment_status !== "pending") {
		return NextResponse.json(
			{
				success: false,
				error: "Order payment is already processed or invalid",
			},
			{ status: 400 }
		);
	}

	// Validate payment method
	if (order.payment_method !== "online") {
		return NextResponse.json(
			{
				success: false,
				error: "Order payment method is not online",
			},
			{ status: 400 }
		);
	}

	// Step 1: Authenticate with Paymob
	console.log("[Paymob Intention] Authenticating with Paymob...");
	const authToken = await authenticatePaymob();

	// Step 2: Prepare order items for Paymob
	const paymobItems: PaymobOrderItem[] = (order.order_items || []).map(
		(item: any) => ({
			name: item.products?.name || "Product",
			amount_cents: (item.price_at_purchase * 100).toString(),
			description:
				item.products?.description?.substring(0, 100) || "Product item",
			quantity: item.quantity.toString(),
		})
	);

	const amountCents = Math.round(order.total_amount * 100);

	// Step 3: Check if Paymob order already exists
	let paymobOrderId: number;
	
	if (order.paymob_order_id) {
		// Reuse existing Paymob order
		console.log("[Paymob Intention] Reusing existing Paymob order:", order.paymob_order_id);
		paymobOrderId = parseInt(order.paymob_order_id);
	} else {
		// Create new order in Paymob with unique merchant order ID
		console.log("[Paymob Intention] Creating new Paymob order...");
		// Append timestamp to ensure uniqueness for retry scenarios
		const uniqueMerchantOrderId = `${order.id}-${Date.now()}`;
		const paymobOrder = await createPaymobOrder(
			authToken,
			amountCents,
			uniqueMerchantOrderId,
			paymobItems
		);
		paymobOrderId = paymobOrder.id;
		console.log("[Paymob Intention] Paymob order created:", paymobOrderId);
	}

	// Step 4: Prepare billing data from shipping address
	const address = order.shipping_address;
	const billingData: PaymobBillingData = {
		apartment: address?.apartment || "N/A",
		email: "customer@aidxbait.com", // You might want to get this from user profile
		floor: address?.floor || "N/A",
		first_name: "Customer", // You might want to get this from user profile
		street: address?.street || "N/A",
		building: address?.building_name || "N/A",
		phone_number: address?.phone || "+201000000000",
		shipping_method: "PKG",
		postal_code: "00000",
		city: address?.city || "Cairo",
		country: "EG",
		last_name: "User", // You might want to get this from user profile
		state: address?.governorate || "Cairo",
	};

	// Step 5: Generate payment key
	console.log("[Paymob Intention] Generating payment key...");
	const paymentKey = await generatePaymentKey(
		authToken,
		amountCents,
		paymobOrderId,
		billingData
	);

	console.log("[Paymob Intention] Payment key generated");

	// Step 6: Update order with Paymob details (only if not already set)
	if (!order.paymob_order_id) {
		const { error: updateError } = await supabaseAdmin
			.from("orders")
			.update({
				paymob_order_id: paymobOrderId.toString(),
				paymob_payment_key: paymentKey,
				updated_at: new Date().toISOString(),
			})
			.eq("id", order_id);

		if (updateError) {
			console.error("[Paymob Intention] Order update error:", updateError);
			// Continue anyway, we can still process the payment
		}
	}

	// Step 7: Generate payment URL
	const paymentUrl = getPaymobPaymentUrl(paymentKey);

	console.log("[Paymob Intention] Payment URL generated successfully");

	return NextResponse.json({
		success: true,
		payment_url: paymentUrl,
		paymob_order_id: paymobOrderId,
	});
	} catch (error) {
		console.error("[Paymob Intention] Unexpected error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to create payment intention",
			},
			{ status: 500 }
		);
	}
}
