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

export async function POST(request: NextRequest) {
	try {
		const { order_id, transaction_id } = await request.json();

		if (!order_id && !transaction_id) {
			return NextResponse.json(
				{
					success: false,
					error: "Either order_id or transaction_id is required",
				},
				{ status: 400 }
			);
		}

		let order;
		let paymobTransactionId;

		// If order_id provided, fetch order from database
		if (order_id) {
			const { data: orderData, error: orderError } = await supabaseAdmin
				.from("orders")
				.select("id, paymob_transaction_id, payment_status, order_status")
				.eq("id", order_id)
				.single();

			if (orderError || !orderData) {
				return NextResponse.json(
					{ success: false, error: "Order not found" },
					{ status: 404 }
				);
			}

			order = orderData;
			paymobTransactionId = orderData.paymob_transaction_id;

			if (!paymobTransactionId) {
				return NextResponse.json(
					{
						success: false,
						error: "Order does not have a Paymob transaction ID",
					},
					{ status: 400 }
				);
			}
		} else {
			// Use provided transaction_id
			paymobTransactionId = transaction_id;

			// Try to find order by transaction_id
			const { data: orderData } = await supabaseAdmin
				.from("orders")
				.select("id, payment_status, order_status")
				.eq("paymob_transaction_id", transaction_id)
				.single();

			order = orderData;
		}

		console.log("[Paymob Verify] Verifying transaction:", paymobTransactionId);

		// Query Paymob for transaction status
		const transaction = await getTransactionStatus(
			parseInt(paymobTransactionId)
		);

		console.log("[Paymob Verify] Transaction status retrieved:", {
			id: transaction.id,
			success: transaction.success,
			pending: transaction.pending,
		});

		// Determine payment and order status
		let paymentStatus: "pending" | "paid" | "failed" = "pending";
		let orderStatus: "pending" | "confirmed" = "pending";

		if (transaction.success && !transaction.pending) {
			paymentStatus = "paid";
			orderStatus = "confirmed";
		} else if (!transaction.success && !transaction.pending) {
			paymentStatus = "failed";
			orderStatus = "pending";
		}

		// Update order if we found it
		if (order) {
			const { error: updateError } = await supabaseAdmin
				.from("orders")
				.update({
					payment_status: paymentStatus,
					order_status: orderStatus,
					paymob_transaction_id: transaction.id.toString(),
					updated_at: new Date().toISOString(),
				})
				.eq("id", order.id);

			if (updateError) {
				console.error("[Paymob Verify] Order update error:", updateError);
				return NextResponse.json(
					{ success: false, error: "Failed to update order status" },
					{ status: 500 }
				);
			}

			console.log("[Paymob Verify] Order status updated successfully");
		}

		return NextResponse.json({
			success: true,
			transaction: {
				id: transaction.id,
				success: transaction.success,
				pending: transaction.pending,
				amount_cents: transaction.amount_cents,
				currency: transaction.currency,
			},
			order: order
				? {
						id: order.id,
						payment_status: paymentStatus,
						order_status: orderStatus,
				  }
				: null,
		});
	} catch (error) {
		console.error("[Paymob Verify] Unexpected error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to verify transaction",
			},
			{ status: 500 }
		);
	}
}
