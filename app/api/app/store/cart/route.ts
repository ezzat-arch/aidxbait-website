import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabaseAuth } from "@/lib/supabase/admin";

/**
 * Helper to get authenticated user ID from Bearer token
 */
async function getUserId(request: NextRequest): Promise<number | null> {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader) return null;

	const token = authHeader.replace("Bearer ", "");
	const {
		data: { user },
		error,
	} = await supabaseAuth.auth.getUser(token);

	if (error || !user) return null;

	// Get internal user id
	const { data: dbUser } = await supabaseAdmin
		.from("users")
		.select("id")
		.eq("supabase_id", user.id)
		.single();

	return dbUser?.id || null;
}

/**
 * GET /api/app/store/cart
 *
 * Fetch cart items for authenticated user
 * Requires: Authorization header with Bearer token
 */
export async function GET(request: NextRequest) {
	try {
		const userId = await getUserId(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { data: cartItems, error } = await supabaseAdmin
			.from("user_cart")
			.select(
				`
				*,
				products (
					id, name, price, discounted_price, currency, stock,
					product_images (image_url, is_main)
				)
			`
			)
			.eq("user_id", userId);

		if (error) throw error;

		const processedCart = cartItems.map((item: any) => {
			const product = item.products;
			const mainImage =
				product.product_images?.find((img: any) => img.is_main)?.image_url ||
				product.product_images?.[0]?.image_url;

			return {
				id: item.id,
				quantity: item.quantity,
				rental_weeks: item.rental_weeks,
				product: {
					...product,
					image: mainImage,
					// Remove nested images array to keep payload light
					product_images: undefined,
				},
			};
		});

		return NextResponse.json({ success: true, data: processedCart });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/app/store/cart
 *
 * Add/update item in cart for authenticated user
 * Requires: Authorization header with Bearer token
 * Body: { product_id, quantity, rental_weeks? }
 */
export async function POST(request: NextRequest) {
	try {
		const userId = await getUserId(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { product_id, quantity, rental_weeks } = body;

		if (!product_id || !quantity) {
			return NextResponse.json(
				{ success: false, error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Upsert: Check if item exists in cart
		const { data: existingItem } = await supabaseAdmin
			.from("user_cart")
			.select("id, quantity")
			.eq("user_id", userId)
			.eq("product_id", product_id)
			.single();

		let result;
		if (existingItem) {
			// Update quantity using upsert
			const { data, error } = await supabaseAdmin
				.from("user_cart")
				.upsert({
					user_id: userId,
					product_id,
					quantity, // Use provided quantity (overwrite)
					rental_weeks: rental_weeks || 0,
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) throw error;
			result = data;
		} else {
			const { data, error } = await supabaseAdmin
				.from("user_cart")
				.insert({
					user_id: userId,
					product_id,
					quantity,
					rental_weeks: rental_weeks || 0,
				})
				.select()
				.single();
			if (error) throw error;
			result = data;
		}

		return NextResponse.json({ success: true, data: result });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/app/store/cart
 *
 * Remove item from cart for authenticated user
 * Requires: Authorization header with Bearer token
 * Query params: product_id or cart_id
 */
export async function DELETE(request: NextRequest) {
	try {
		const userId = await getUserId(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const searchParams = request.nextUrl.searchParams;
		const productId = searchParams.get("product_id");
		const cartId = searchParams.get("cart_id"); // Allow deleting by cart_id if needed

		let query = supabaseAdmin.from("user_cart").delete().eq("user_id", userId);

		if (productId) {
			query = query.eq("product_id", productId);
		} else if (cartId) {
			query = query.eq("id", cartId);
		} else {
			// If no specific item, require an ID to avoid accidental cart clearing
			return NextResponse.json(
				{ success: false, error: "Missing product_id or cart_id" },
				{ status: 400 }
			);
		}

		const { error } = await query;
		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
