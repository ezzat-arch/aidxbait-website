import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyHMAC } from "@/lib/paymob/paymob-service";

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

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract all callback parameters (GET request - all values are strings)
		const callbackData: Record<string, any> = {};
		searchParams.forEach((value, key) => {
			callbackData[key] = value;
		});

		// Normalize dotted notation to underscore notation for source_data fields
		// Paymob sends: source_data.type, source_data.pan, source_data.sub_type
		// HMAC calculation expects: source_data_type, source_data_pan, source_data_sub_type
		if (callbackData["source_data.type"]) {
			callbackData["source_data_type"] = callbackData["source_data.type"];
		}
		if (callbackData["source_data.pan"]) {
			callbackData["source_data_pan"] = callbackData["source_data.pan"];
		}
		if (callbackData["source_data.sub_type"]) {
			callbackData["source_data_sub_type"] =
				callbackData["source_data.sub_type"];
		}

		console.log(
			"[Paymob Callback GET] ========== New Callback Received =========="
		);
		console.log("[Paymob Callback GET] Transaction summary:", {
			transaction_id: callbackData.id,
			order_id: callbackData.order,
			success: callbackData.success,
			pending: callbackData.pending,
			amount_cents: callbackData.amount_cents,
		});

		// Log all query parameters for debugging
		console.log("[Paymob Callback GET] All query parameters:");
		const paramCount = Array.from(searchParams.keys()).length;
		console.log(`  Total parameters: ${paramCount}`);

		// Log ALL parameters to see if we're missing any
		const allParams: string[] = [];
		searchParams.forEach((value, key) => {
			allParams.push(key);
			// Truncate long values for readability (except hmac - show first/last)
			if (key === "hmac") {
				console.log(
					`  ${key}: ${value.substring(0, 20)}...${value.substring(
						value.length - 20
					)}`
				);
			} else {
				const displayValue =
					value.length > 50 ? value.substring(0, 50) + "..." : value;
				console.log(`  ${key}: "${displayValue}"`);
			}
		});
		console.log(
			`[Paymob Callback GET] All parameter keys: ${allParams.join(", ")}`
		);

		// Step 1: Verify HMAC signature
		console.log("[Paymob Callback GET] Starting HMAC verification...");
		const isValidHmac = verifyHMAC(callbackData);
		if (!isValidHmac) {
			console.error("[Paymob Callback] Invalid HMAC signature");
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
				}/services/store?payment=failed&error=invalid_signature`
			);
		}

		console.log("[Paymob Callback] HMAC verified successfully");

		// Step 2: Extract transaction details
		const transactionId = callbackData.id;
		const paymobOrderId = callbackData.order;
		const success = callbackData.success === "true";
		const pending = callbackData.pending === "true";

		// Step 3: Find order in database by paymob_order_id
		const { data: order, error: orderError } = await supabaseAdmin
			.from("orders")
			.select("id, payment_status, order_status, patient_id")
			.eq("paymob_order_id", paymobOrderId)
			.single();

		if (orderError || !order) {
			console.error("[Paymob Callback] Order not found:", orderError);
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
				}/services/store?payment=failed&error=order_not_found`
			);
		}

		console.log("[Paymob Callback] Order found:", order.id);

		// Step 4: Update order based on transaction status
		let paymentStatus: "pending" | "paid" | "failed" = "pending";
		let orderStatus: "pending" | "confirmed" = "pending";

		if (success && !pending) {
			// Payment successful
			paymentStatus = "paid";
			orderStatus = "confirmed";
			console.log("[Paymob Callback] Payment successful");
		} else if (!success && !pending) {
			// Payment failed
			paymentStatus = "failed";
			orderStatus = "pending";
			console.log("[Paymob Callback] Payment failed");
		} else if (pending) {
			// Payment pending
			paymentStatus = "pending";
			orderStatus = "pending";
			console.log("[Paymob Callback] Payment pending");
		}

		// Step 5: Update order in database
		const { error: updateError } = await supabaseAdmin
			.from("orders")
			.update({
				payment_status: paymentStatus,
				order_status: orderStatus,
				paymob_transaction_id: transactionId,
				updated_at: new Date().toISOString(),
			})
			.eq("id", order.id);

		if (updateError) {
			console.error("[Paymob Callback] Order update error:", updateError);
			return NextResponse.redirect(
				`${
					process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
				}/services/store?payment=failed&error=update_failed`
			);
		}

		console.log("[Paymob Callback] Order updated successfully");

		// NOTE: Cart clearing is NOT needed here
		// The cart was already cleared when the order was created (see /api/orders)
		// Client-side cart was also cleared before redirecting to payment gateway
		// This ensures cart is empty regardless of payment outcome

		// Step 6: Redirect based on payment status
		const redirectUrl = `${
			process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
		}/services/store`;

		if (success && !pending) {
			return NextResponse.redirect(
				`${redirectUrl}?payment=success&order_id=${order.id}`
			);
		} else if (!success && !pending) {
			return NextResponse.redirect(
				`${redirectUrl}?payment=failed&reason=${
					callbackData.error_occured || "unknown"
				}`
			);
		} else {
			return NextResponse.redirect(
				`${redirectUrl}?payment=pending&order_id=${order.id}`
			);
		}
	} catch (error) {
		console.error("[Paymob Callback] Unexpected error:", error);
		return NextResponse.redirect(
			`${
				process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
			}/services/store?payment=failed&error=server_error`
		);
	}
}

// Also handle POST requests (some payment gateways send POST callbacks)
export async function POST(request: NextRequest) {
	try {
		const callbackData = await request.json();

		console.log(
			"[Paymob Callback POST] ========== New Callback Received =========="
		);
		console.log("[Paymob Callback POST] Raw callback structure:", {
			hasObj: !!callbackData.obj,
			topLevelKeys: Object.keys(callbackData).join(", "),
		});

		// Extract transaction details from nested object
		// Important: HMAC is at top level, transaction data is in 'obj'
		const transactionData = callbackData.obj || callbackData;
		if (callbackData.obj && callbackData.hmac) {
			transactionData.hmac = callbackData.hmac;
			console.log(
				"[Paymob Callback POST] HMAC found at parent level, attached to transaction data"
			);
		}

		console.log("[Paymob Callback POST] Transaction summary:", {
			transaction_id: transactionData.id,
			order_id:
				typeof transactionData.order === "object"
					? transactionData.order?.id
					: transactionData.order,
			success: transactionData.success,
			pending: transactionData.pending,
			amount_cents: transactionData.amount_cents,
			has_hmac: !!transactionData.hmac,
		});

		// Log key transaction fields
		console.log("[Paymob Callback POST] Key transaction fields:");
		const keyFields = [
			"id",
			"amount_cents",
			"success",
			"pending",
			"currency",
			"integration_id",
			"order",
			"hmac",
			"created_at",
		];
		keyFields.forEach((field) => {
			const value = transactionData[field];
			if (field === "hmac") {
				// Show first and last 20 chars of HMAC
				const hmacStr = value ? String(value) : "undefined";
				console.log(
					`  ${field}: ${
						hmacStr.length > 40
							? hmacStr.substring(0, 20) +
							  "..." +
							  hmacStr.substring(hmacStr.length - 20)
							: hmacStr
					}`
				);
			} else {
				const displayValue =
					typeof value === "string" && value.length > 50
						? value.substring(0, 50) + "..."
						: value;
				console.log(`  ${field}: ${JSON.stringify(displayValue)}`);
			}
		});

		// Verify HMAC signature (POST callbacks may not include HMAC)
		console.log("[Paymob Callback POST] Starting HMAC verification...");
		const isValidHmac = verifyHMAC(transactionData, false);
		if (!isValidHmac) {
			console.error("[Paymob Callback POST] Invalid HMAC signature");
			return NextResponse.json(
				{ success: false, error: "Invalid HMAC" },
				{ status: 401 }
			);
		}

		console.log(
			"[Paymob Callback POST] HMAC verified successfully (or not required)"
		);

		// Extract details
		const transactionId = transactionData.id;
		const paymobOrderId =
			typeof transactionData.order === "object"
				? transactionData.order.id
				: transactionData.order;
		const success = transactionData.success === true;
		const pending = transactionData.pending === true;

		// Find order in database
		const { data: order, error: orderError } = await supabaseAdmin
			.from("orders")
			.select("id, payment_status, patient_id")
			.eq("paymob_order_id", paymobOrderId.toString())
			.single();

		if (orderError || !order) {
			console.error("[Paymob Callback POST] Order not found:", orderError);
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		// Update order status
		let paymentStatus: "pending" | "paid" | "failed" = "pending";
		let orderStatus: "pending" | "confirmed" = "pending";

		if (success && !pending) {
			paymentStatus = "paid";
			orderStatus = "confirmed";
		} else if (!success && !pending) {
			paymentStatus = "failed";
			orderStatus = "pending";
		}

		// Update database
		const { error: updateError } = await supabaseAdmin
			.from("orders")
			.update({
				payment_status: paymentStatus,
				order_status: orderStatus,
				paymob_transaction_id: transactionId.toString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", order.id);

		if (updateError) {
			console.error("[Paymob Callback POST] Order update error:", updateError);
			return NextResponse.json(
				{ success: false, error: "Failed to update order" },
				{ status: 500 }
			);
		}

		// NOTE: Cart clearing is NOT needed here
		// The cart was already cleared when the order was created (see /api/orders)
		// Client-side cart was also cleared before redirecting to payment gateway

		console.log("[Paymob Callback POST] Order updated successfully");

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Paymob Callback POST] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Server error" },
			{ status: 500 }
		);
	}
}
