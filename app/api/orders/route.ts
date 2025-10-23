import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
	CreateOrderRequest,
	OrderFilters,
	OrderType,
} from "@/lib/order-types";
import { TAX_RATE, SHIPPING_COST } from "@/lib/order-types";

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

// GET - Fetch orders for a patient
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const patientId = searchParams.get("patient_id");

		if (!patientId) {
			return NextResponse.json(
				{ success: false, error: "Patient ID is required" },
				{ status: 400 }
			);
		}

		// Build query with optional filters
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
			`
			)
			.eq("patient_id", patientId)
			.eq("soft_deleted", false);

		// Apply filters
		const orderStatus = searchParams.get("order_status");
		if (orderStatus) {
			query = query.eq("order_status", orderStatus);
		}

		const paymentStatus = searchParams.get("payment_status");
		if (paymentStatus) {
			query = query.eq("payment_status", paymentStatus);
		}

		const orderType = searchParams.get("order_type");
		if (orderType) {
			query = query.eq("order_type", orderType);
		}

		const fromDate = searchParams.get("from_date");
		if (fromDate) {
			query = query.gte("order_date", fromDate);
		}

		const toDate = searchParams.get("to_date");
		if (toDate) {
			query = query.lte("order_date", toDate);
		}

		// Pagination
		const limit = parseInt(searchParams.get("limit") || "50");
		const offset = parseInt(searchParams.get("offset") || "0");

		query = query
			.order("order_date", { ascending: false })
			.range(offset, offset + limit - 1);

		const { data: orders, error, count } = await query;

		if (error) {
			console.error("[Orders API] Error fetching orders:", error);
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
		console.error("[Orders API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// POST - Create new order
export async function POST(request: NextRequest) {
	try {
		const body: CreateOrderRequest = await request.json();

		// Log incoming request for debugging
		console.log("[Orders API] Creating order with payload:", {
			patient_id: body.patient_id,
			items_count: body.items?.length,
			shipping_address_id: body.shipping_address_id,
			billing_address_id: body.billing_address_id,
			payment_method: body.payment_method,
			discount_amount: body.discount_amount,
		});

		// Validate required fields
		if (
			!body.patient_id ||
			!body.items ||
			body.items.length === 0 ||
			!body.shipping_address_id ||
			!body.payment_method
		) {
			return NextResponse.json(
				{
					success: false,
					error:
						"Missing required fields: patient_id, items, shipping_address_id, payment_method",
				},
				{ status: 400 }
			);
		}

		// Validate payment method
		if (!["cash_on_delivery", "online"].includes(body.payment_method)) {
			return NextResponse.json(
				{
					success: false,
					error:
						"Invalid payment_method. Must be 'cash_on_delivery' or 'online'",
				},
				{ status: 400 }
			);
		}

		// Validate shipping address belongs to patient
		const { data: shippingAddress, error: shippingError } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("id", body.shipping_address_id)
			.eq("patient_id", body.patient_id)
			.eq("is_deleted", false)
			.single();

		if (shippingError || !shippingAddress) {
			return NextResponse.json(
				{ success: false, error: "Invalid shipping address" },
				{ status: 400 }
			);
		}

		// Validate billing address if provided, otherwise use shipping address
		const billingAddressId =
			body.billing_address_id || body.shipping_address_id;

		if (body.billing_address_id) {
			const { data: billingAddress, error: billingError } = await supabaseAdmin
				.from("patient_addresses")
				.select("*")
				.eq("id", body.billing_address_id)
				.eq("patient_id", body.patient_id)
				.eq("is_deleted", false)
				.single();

			if (billingError || !billingAddress) {
				return NextResponse.json(
					{ success: false, error: "Invalid billing address" },
					{ status: 400 }
				);
			}
		}

		// Fetch and validate all products
		const productIds = body.items.map((item) => item.product_id);
		const { data: products, error: productsError } = await supabaseAdmin
			.from("products")
			.select("*")
			.in("id", productIds)
			.eq("is_available", true)
			.eq("soft_deleted", false);

		if (productsError || !products || products.length !== productIds.length) {
			return NextResponse.json(
				{ success: false, error: "One or more products are unavailable" },
				{ status: 400 }
			);
		}

		// Create a map for easy lookup
		const productMap = new Map(products.map((p) => [p.id, p]));

		// Validate stock and rental dates
		let hasRentalItem = false;
		for (const item of body.items) {
			const product = productMap.get(item.product_id);
			if (!product) {
				return NextResponse.json(
					{
						success: false,
						error: `Product ${item.product_id} not found`,
					},
					{ status: 400 }
				);
			}

			// Check stock
			if (product.stock < item.quantity) {
				return NextResponse.json(
					{
						success: false,
						error: `Insufficient stock for product: ${product.name}`,
					},
					{ status: 400 }
				);
			}

			// Check rental requirements
			if (product.is_for_rent) {
				hasRentalItem = true;
				if (!item.rental_start_date || !item.rental_end_date) {
					return NextResponse.json(
						{
							success: false,
							error: `Rental dates required for product: ${product.name}`,
						},
						{ status: 400 }
					);
				}

				// Validate rental dates
				const startDate = new Date(item.rental_start_date);
				const endDate = new Date(item.rental_end_date);
				const now = new Date();

				if (startDate < now) {
					return NextResponse.json(
						{
							success: false,
							error: "Rental start date must be in the future",
						},
						{ status: 400 }
					);
				}

				if (endDate <= startDate) {
					return NextResponse.json(
						{
							success: false,
							error: "Rental end date must be after start date",
						},
						{ status: 400 }
					);
				}
			}
		}

		// Determine order type
		const orderType: OrderType = hasRentalItem ? "rental" : "purchase";

		// Calculate totals
		let subtotal = 0;
		for (const item of body.items) {
			const product = productMap.get(item.product_id)!;
			const price = product.discounted_price || product.price;
			subtotal += price * item.quantity;
		}

		const tax = subtotal * TAX_RATE;
		const shipping = SHIPPING_COST;
		const discount = body.discount_amount || 0;
		const total = subtotal + tax + shipping - discount;

		// Log resolved values pre-insert for clarity
		console.log("[Orders API] Pre-insert resolved values:", {
			order_type: orderType,
			patient_id: body.patient_id,
			shipping_address_id: body.shipping_address_id,
			billing_address_id: billingAddressId,
			payment_method: body.payment_method,
		});

		// Start transaction by creating the order
		const { data: newOrder, error: orderError } = await supabaseAdmin
			.from("orders")
			.insert({
				order_type: orderType,
				patient_id: body.patient_id,
				shipping_address_id: body.shipping_address_id,
				billing_address_id: billingAddressId,
				subtotal_amount: subtotal,
				tax_amount: tax,
				discount_amount: discount,
				shipping_amount: shipping,
				total_amount: total,
				payment_method: body.payment_method,
				payment_status: "pending",
				order_status: "pending",
				paymob_order_id: null,
				paymob_transaction_id: null,
				paymob_payment_key: null,
			})
			.select()
			.single();

		if (orderError) {
			console.error("[Orders API] Error creating order:", {
				error: orderError.message,
				code: orderError.code,
				details: orderError.details,
				hint: orderError.hint,
				context: {
					patient_id: body.patient_id,
					order_type: orderType,
					shipping_address_id: body.shipping_address_id,
					billing_address_id: billingAddressId,
					calculated_totals: {
						subtotal,
						tax,
						discount,
						shipping,
						total,
					},
				},
			});
			return NextResponse.json(
				{ success: false, error: "Failed to create order" },
				{ status: 500 }
			);
		}

		// Create order items
		const orderItems = body.items.map((item) => {
			const product = productMap.get(item.product_id)!;
			const price = product.discounted_price || product.price;

			return {
				order_id: newOrder.id,
				product_id: item.product_id,
				quantity: item.quantity,
				price_at_purchase: price,
				rental_start_date: item.rental_start_date
					? item.rental_start_date.slice(0, 10)
					: null,
				rental_end_date: item.rental_end_date
					? item.rental_end_date.slice(0, 10)
					: null,
			};
		});

		const { error: itemsError } = await supabaseAdmin
			.from("order_items")
			.insert(orderItems);

		if (itemsError) {
			console.error("[Orders API] Error creating order items:", {
				error: itemsError.message,
				code: itemsError.code,
				details: itemsError.details,
				hint: itemsError.hint,
				context: {
					order_id: newOrder.id,
					items_count: orderItems.length,
					order_items: orderItems,
				},
			});
			// Rollback: delete the order
			await supabaseAdmin.from("orders").delete().eq("id", newOrder.id);
			return NextResponse.json(
				{ success: false, error: "Failed to create order items" },
				{ status: 500 }
			);
		}

		// Update product stock
		for (const item of body.items) {
			const product = productMap.get(item.product_id)!;
			const newStock = product.stock - item.quantity;

			const { error: stockError } = await supabaseAdmin
				.from("products")
				.update({
					stock: newStock,
					is_oos: newStock === 0,
				})
				.eq("id", item.product_id);

			if (stockError) {
				console.error("[Orders API] Error updating stock:", {
					error: stockError.message,
					code: stockError.code,
					details: stockError.details,
					hint: stockError.hint,
					context: {
						product_id: item.product_id,
						product_name: product.name,
						old_stock: product.stock,
						quantity_ordered: item.quantity,
						new_stock: newStock,
					},
				});
				// Continue anyway, stock can be manually adjusted
			}
		}

		// Clear the user's cart (use user_id from patient)
		// NOTE: This is the single source of truth for server-side cart clearing
		// The cart is cleared immediately after successful order creation, regardless of payment method
		// For online payments: Client also clears cart before redirecting to payment gateway
		// For cash on delivery: Client clears cart after order creation
		// Payment callbacks do NOT need to clear the cart again (it's already cleared here)
		const { data: patientData } = await supabaseAdmin
			.from("patients")
			.select("user_id")
			.eq("id", body.patient_id)
			.single();

		if (patientData?.user_id) {
			await supabaseAdmin
				.from("user_cart")
				.delete()
				.eq("user_id", patientData.user_id);
			console.log("[Orders API] Cart cleared for user:", patientData.user_id);
		}

		// Fetch the complete order with items
		const { data: completeOrder } = await supabaseAdmin
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
			`
			)
			.eq("id", newOrder.id)
			.single();

		return NextResponse.json(
			{ success: true, data: completeOrder || newOrder },
			{ status: 201 }
		);
	} catch (error) {
		console.error("[Orders API] Unexpected error:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : undefined,
		});
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
