import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
	verifyHMAC,
	ALLOW_CALLBACKS_WITHOUT_HMAC,
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

// Deep link scheme for the mobile app
const APP_SCHEME = "doctoory";

/**
 * Mobile Payment Callback Handler
 *
 * This endpoint handles redirects from Paymob after mobile payments.
 * It verifies the transaction, updates the database, and redirects
 * to the mobile app using deep linking.
 *
 * Flow:
 * 1. User completes payment in Paymob SDK webview
 * 2. Paymob redirects to this endpoint with transaction params
 * 3. We verify HMAC and update the order status
 * 4. We redirect to doctoory://payment-result?... to return to the app
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Extract all callback parameters
		const callbackData: Record<string, string> = {};
		searchParams.forEach((value, key) => {
			callbackData[key] = value;
		});

		// Normalize dotted notation to underscore notation for source_data fields
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
			"[Paymob Mobile Callback] ========== New Mobile Callback =========="
		);
		console.log("[Paymob Mobile Callback] Transaction summary:", {
			transaction_id: callbackData.id,
			order_id: callbackData.order,
			success: callbackData.success,
			pending: callbackData.pending,
			amount_cents: callbackData.amount_cents,
		});

		// Step 1: Verify HMAC signature
		console.log("[Paymob Mobile Callback] Verifying HMAC...");
		const requireHmac = !ALLOW_CALLBACKS_WITHOUT_HMAC;
		const isValidHmac = verifyHMAC(callbackData, requireHmac);

		if (!isValidHmac) {
			console.error("[Paymob Mobile Callback] Invalid HMAC signature");
			return redirectToApp({
				status: "failed",
				error: "invalid_signature",
			});
		}

		console.log("[Paymob Mobile Callback] HMAC verified successfully");

		// Step 2: Extract transaction details
		const transactionId = callbackData.id;
		const paymobOrderId = callbackData.order;
		const success = callbackData.success === "true";
		const pending = callbackData.pending === "true";

		// Step 3: Find order in database by paymob_order_id (intention_id)
		const { data: order, error: orderError } = await supabaseAdmin
			.from("orders")
			.select("id, payment_status, order_status, patient_id")
			.eq("paymob_order_id", paymobOrderId)
			.single();

		if (orderError || !order) {
			console.error("[Paymob Mobile Callback] Order not found:", orderError);
			return redirectToApp({
				status: "failed",
				error: "order_not_found",
			});
		}

		console.log("[Paymob Mobile Callback] Order found:", order.id);

		// Step 4: Determine payment and order status
		let paymentStatus: "pending" | "completed" | "failed" = "pending";
		let orderStatus: "pending" | "confirmed" = "pending";

		if (success && !pending) {
			paymentStatus = "completed";
			orderStatus = "confirmed";
			console.log("[Paymob Mobile Callback] Payment successful");
		} else if (!success && !pending) {
			paymentStatus = "failed";
			orderStatus = "pending";
			console.log("[Paymob Mobile Callback] Payment failed");
		} else if (pending) {
			paymentStatus = "pending";
			orderStatus = "pending";
			console.log("[Paymob Mobile Callback] Payment pending");
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
			console.error(
				"[Paymob Mobile Callback] Order update error:",
				updateError
			);
			return redirectToApp({
				status: "failed",
				error: "update_failed",
				orderId: order.id.toString(),
			});
		}

		console.log("[Paymob Mobile Callback] Order updated successfully");

		// Step 6: Redirect to mobile app via deep link
		if (success && !pending) {
			return redirectToApp({
				status: "success",
				orderId: order.id.toString(),
				transactionId: transactionId,
			});
		} else if (!success && !pending) {
			return redirectToApp({
				status: "failed",
				orderId: order.id.toString(),
				error: callbackData.error_occured || "payment_declined",
			});
		} else {
			return redirectToApp({
				status: "pending",
				orderId: order.id.toString(),
				transactionId: transactionId,
			});
		}
	} catch (error) {
		console.error("[Paymob Mobile Callback] Unexpected error:", error);
		return redirectToApp({
			status: "failed",
			error: "server_error",
		});
	}
}

/**
 * Redirect to the mobile app using deep linking
 */
function redirectToApp(params: {
	status: "success" | "failed" | "pending";
	orderId?: string;
	transactionId?: string;
	error?: string;
}): NextResponse {
	const queryParams = new URLSearchParams();
	queryParams.set("status", params.status);

	if (params.orderId) {
		queryParams.set("order_id", params.orderId);
	}
	if (params.transactionId) {
		queryParams.set("transaction_id", params.transactionId);
	}
	if (params.error) {
		queryParams.set("error", params.error);
	}

	const deepLink = `${APP_SCHEME}://payment-result?${queryParams.toString()}`;

	console.log("[Paymob Mobile Callback] Redirecting to app:", deepLink);

	// Use 302 redirect to the deep link
	return NextResponse.redirect(deepLink, { status: 302 });
}
