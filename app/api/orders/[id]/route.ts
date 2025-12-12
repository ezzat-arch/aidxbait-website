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

// PATCH - Cancel an order
export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const body = await request.json();
		const { patient_id, cancellation_reason } = body;

		// Validate required fields
		if (!patient_id) {
			return NextResponse.json(
				{ success: false, error: "Patient ID is required" },
				{ status: 400 }
			);
		}

		if (!cancellation_reason || cancellation_reason.trim() === "") {
			return NextResponse.json(
				{ success: false, error: "Cancellation reason is required" },
				{ status: 400 }
			);
		}

		// Fetch the order with order items to validate and restore stock
		const { data: order, error: fetchError } = await supabaseAdmin
			.from("orders")
			.select(
				`
				*,
				order_items (
					id,
					product_id,
					quantity
				)
			`
			)
			.eq("id", id)
			.eq("patient_id", patient_id)
			.eq("soft_deleted", false)
			.single();

		if (fetchError || !order) {
			console.error("[Orders API] Order not found:", fetchError);
			return NextResponse.json(
				{ success: false, error: "Order not found" },
				{ status: 404 }
			);
		}

		// Validate order status - only pending orders can be cancelled
		if (order.order_status !== "pending") {
			return NextResponse.json(
				{
					success: false,
					error: `Cannot cancel order with status "${order.order_status}". Only pending orders can be cancelled.`,
				},
				{ status: 400 }
			);
		}

		// Get user_id from patient for cancelled_by field
		const { data: patient, error: patientError } = await supabaseAdmin
			.from("patients")
			.select("user_id")
			.eq("id", patient_id)
			.single();

		if (patientError || !patient) {
			console.error("[Orders API] Patient not found:", patientError);
			return NextResponse.json(
				{ success: false, error: "Patient not found" },
				{ status: 404 }
			);
		}

		// Update the order status to cancelled
		const { error: updateError } = await supabaseAdmin
			.from("orders")
			.update({
				order_status: "cancelled",
				cancellation_reason: cancellation_reason.trim(),
				cancellation_date: new Date().toISOString(),
				cancelled_by: patient.user_id,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (updateError) {
			console.error("[Orders API] Error updating order:", updateError);
			return NextResponse.json(
				{ success: false, error: "Failed to cancel order" },
				{ status: 500 }
			);
		}

		// Restore stock for all order items
		for (const item of order.order_items || []) {
			const { data: product } = await supabaseAdmin
				.from("products")
				.select("stock")
				.eq("id", item.product_id)
				.single();

			if (product) {
				const newStock = product.stock + item.quantity;
				await supabaseAdmin
					.from("products")
					.update({
						stock: newStock,
						is_oos: false, // Product is back in stock
						updated_at: new Date().toISOString(),
					})
					.eq("id", item.product_id);
			}
		}

		console.log(
			`[Orders API] Order ${id} cancelled by user ${patient.user_id}`
		);

		return NextResponse.json({
			success: true,
			message: "Order cancelled successfully",
		});
	} catch (error) {
		console.error("[Orders API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
