import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Helper to get authenticated user ID from Bearer token
 */
async function getUserId(request: NextRequest): Promise<number | null> {
	const authHeader = request.headers.get("Authorization");
	console.log("[Cart API] Auth header present:", !!authHeader);

	if (!authHeader) {
		console.log("[Cart API] No Authorization header found");
		return null;
	}

	const token = authHeader.replace("Bearer ", "");
	console.log("[Cart API] Token length:", token.length);
	console.log("[Cart API] Token preview:", token.substring(0, 50) + "...");

	// Use admin client to validate the token
	const {
		data: { user },
		error,
	} = await supabaseAdmin.auth.getUser(token);

	console.log(
		"[Cart API] Supabase getUser result - user:",
		!!user,
		"error:",
		error?.message
	);

	if (error) {
		console.error("[Cart API] Auth error details:", {
			message: error.message,
			status: error.status,
			name: error.name,
		});
		return null;
	}

	if (!user) {
		console.log("[Cart API] No user returned from getUser");
		return null;
	}

	console.log("[Cart API] Supabase user id:", user.id);

	// Get internal user id
	const { data: dbUser, error: dbError } = await supabaseAdmin
		.from("users")
		.select("id")
		.eq("supabase_id", user.id)
		.single();

	console.log(
		"[Cart API] DB user lookup - found:",
		!!dbUser,
		"error:",
		dbError?.message
	);

	if (dbError) {
		console.error("[Cart API] DB error:", dbError);
	}

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

		// Use upsert with onConflict to handle both insert and update
		const { data: result, error } = await supabaseAdmin
			.from("user_cart")
			.upsert(
				{
					user_id: userId,
					product_id,
					quantity,
					rental_weeks: rental_weeks || 0,
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: "user_id,product_id",
				}
			)
			.select()
			.single();

		if (error) throw error;

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
