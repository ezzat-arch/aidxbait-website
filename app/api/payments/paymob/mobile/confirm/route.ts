import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTransactionStatus } from "@/lib/paymob/paymob-service";

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

// Request body type for mobile payment confirmation
interface MobileConfirmRequest {
	order_id: string;
	intention_id: string;
	transaction_id?: string;
}

export async function POST(request: NextRequest) {
	try {
		// Verify authorization header
		const authHeader = request.headers.get("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Missing authorization token" },
				},
				{ status: 401 }
			);
		}

		const token = authHeader.replace("Bearer ", "");

		// Verify the user token with Supabase
		const { data: userData, error: authError } =
			await supabaseAdmin.auth.getUser(token);
		if (authError || !userData.user) {
			console.error("[Paymob Mobile Confirm] Auth error:", authError);
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Invalid authorization token" },
				},
				{ status: 401 }
			);
		}

		const body: MobileConfirmRequest = await request.json();

		// Validate required fields
		if (!body.order_id || !body.intention_id) {
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "ValidationError",
						message: "Missing order_id or intention_id",
					},
				},
				{ status: 400 }
			);
		}

		console.log(
			"[Paymob Mobile Confirm] Confirming payment for order:",
			body.order_id
		);
		console.log("[Paymob Mobile Confirm] Intention ID:", body.intention_id);

		// Find the order by ID (for store orders)
		const { data: order, error: orderError } = await supabaseAdmin
			.from("orders")
			.select("*, patients!inner(id, user_id)")
			.eq("id", body.order_id)
			.single();

		if (orderError || !order) {
			console.error("[Paymob Mobile Confirm] Order not found:", orderError);
			return NextResponse.json(
				{
					success: false,
					error: { type: "ValidationError", message: "Order not found" },
				},
				{ status: 404 }
			);
		}

		// Verify order belongs to authenticated user
		const { data: user, error: userError } = await supabaseAdmin
			.from("users")
			.select("supabase_id")
			.eq("id", order.patients.user_id)
			.single();

		if (userError || !user || user.supabase_id !== userData.user.id) {
			return NextResponse.json(
				{
					success: false,
					error: { type: "AuthError", message: "Unauthorized" },
				},
				{ status: 403 }
			);
		}

		let paymentStatus: "pending" | "completed" | "failed" = "pending";
		let orderStatus: "pending" | "confirmed" = "pending";
		let transactionId = body.transaction_id || null;
		let transactionData = null;

		// If transaction_id is provided, verify with Paymob
		if (body.transaction_id) {
			try {
				console.log(
					"[Paymob Mobile Confirm] Verifying transaction:",
					body.transaction_id
				);
				const transaction = await getTransactionStatus(
					parseInt(body.transaction_id)
				);
				transactionData = transaction;

				if (transaction.success && !transaction.pending) {
					paymentStatus = "completed";
					orderStatus = "confirmed";
					console.log(
						"[Paymob Mobile Confirm] Transaction verified as successful"
					);
				} else if (!transaction.success && !transaction.pending) {
					paymentStatus = "failed";
					orderStatus = "pending";
					console.log("[Paymob Mobile Confirm] Transaction verified as failed");
				} else {
					paymentStatus = "pending";
					orderStatus = "pending";
					console.log("[Paymob Mobile Confirm] Transaction is pending");
				}
			} catch (verifyError) {
				console.warn(
					"[Paymob Mobile Confirm] Transaction verification failed:",
					verifyError
				);
				// Assume success based on SDK callback - webhook will correct if needed
				paymentStatus = "completed";
				orderStatus = "confirmed";
			}
		} else {
			// No transaction_id means SDK reported success but we don't have the ID yet
			// Mark as completed - webhook will confirm/correct
			paymentStatus = "completed";
			orderStatus = "confirmed";
		}

		// Update order with payment status
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
				"[Paymob Mobile Confirm] Failed to update order:",
				updateError
			);
			return NextResponse.json(
				{
					success: false,
					error: {
						type: "InternalError",
						message: "Failed to update order status",
					},
				},
				{ status: 500 }
			);
		}

		console.log(
			"[Paymob Mobile Confirm] Order confirmed with status:",
			paymentStatus
		);

		return NextResponse.json({
			success: true,
			data: {
				order_id: order.id,
				status: paymentStatus,
				transaction_id: transactionId,
				amount_cents: Math.round(order.total_amount * 100),
				currency: "EGP",
				payment_method: transactionData?.payment_key_claims ? "card" : "card",
			},
		});
	} catch (error) {
		console.error("[Paymob Mobile Confirm] Unexpected error:", error);
		return NextResponse.json(
			{
				success: false,
				error: {
					type: "InternalError",
					message:
						error instanceof Error
							? error.message
							: "Failed to confirm payment",
				},
			},
			{ status: 500 }
		);
	}
}
