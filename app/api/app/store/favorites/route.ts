import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Helper to get authenticated user ID from Bearer token
 */
async function getUserId(request: NextRequest): Promise<number | null> {
	const authHeader = request.headers.get("Authorization");

	if (!authHeader) {
		console.log("[Favorites API] No Authorization header found");
		return null;
	}

	const token = authHeader.replace("Bearer ", "");

	// Use admin client to validate the token
	const {
		data: { user },
		error,
	} = await supabaseAdmin.auth.getUser(token);

	if (error || !user) {
		console.error("[Favorites API] Auth error:", error?.message);
		return null;
	}

	// Get internal user id
	const { data: dbUser, error: dbError } = await supabaseAdmin
		.from("users")
		.select("id")
		.eq("supabase_id", user.id)
		.single();

	if (dbError) {
		console.error("[Favorites API] DB error:", dbError);
		return null;
	}

	return dbUser?.id || null;
}

/**
 * GET /api/app/store/favorites
 *
 * Fetch favorite products for authenticated user
 * Returns products with their details and images
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

		const { data: favorites, error } = await supabaseAdmin
			.from("user_favorite_products")
			.select(
				`
				id,
				product_id,
				added_at,
				products (
					id,
					name,
					name_ar,
					description,
					description_ar,
					price,
					discounted_price,
					currency,
					stock,
					is_best_seller,
					is_featured,
					is_available,
					is_for_rent,
					rent_term,
					category_id,
					product_images (image_url, is_main)
				)
			`
			)
			.eq("user_id", userId)
			.order("added_at", { ascending: false });

		if (error) throw error;

		// Process favorites to include main image
		const processedFavorites = favorites.map((fav: any) => {
			const product = fav.products;
			const mainImage =
				product.product_images?.find((img: any) => img.is_main)?.image_url ||
				product.product_images?.[0]?.image_url;

			return {
				id: fav.id,
				product_id: fav.product_id,
				added_at: fav.added_at,
				product: {
					...product,
					image: mainImage,
					images: product.product_images?.map((img: any) => img.image_url) || [],
					product_images: undefined,
				},
			};
		});

		// Also return just the product IDs for quick lookup
		const favoriteIds = favorites.map((fav: any) => fav.product_id);

		return NextResponse.json({
			success: true,
			data: processedFavorites,
			favoriteIds,
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("[Favorites API] GET error:", error.message);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/app/store/favorites
 *
 * Add a product to favorites
 * Body: { product_id: number }
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
		const { product_id } = body;

		if (!product_id) {
			return NextResponse.json(
				{ success: false, error: "Missing product_id" },
				{ status: 400 }
			);
		}

		// Check if already favorited
		const { data: existing } = await supabaseAdmin
			.from("user_favorite_products")
			.select("id")
			.eq("user_id", userId)
			.eq("product_id", product_id)
			.single();

		if (existing) {
			return NextResponse.json({
				success: true,
				message: "Already in favorites",
				data: existing,
			});
		}

		// Add to favorites
		const { data: result, error } = await supabaseAdmin
			.from("user_favorite_products")
			.insert({
				user_id: userId,
				product_id,
			})
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({
			success: true,
			message: "Added to favorites",
			data: result,
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("[Favorites API] POST error:", error.message);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/app/store/favorites
 *
 * Remove a product from favorites
 * Query params: product_id
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

		if (!productId) {
			return NextResponse.json(
				{ success: false, error: "Missing product_id" },
				{ status: 400 }
			);
		}

		const { error } = await supabaseAdmin
			.from("user_favorite_products")
			.delete()
			.eq("user_id", userId)
			.eq("product_id", productId);

		if (error) throw error;

		return NextResponse.json({
			success: true,
			message: "Removed from favorites",
		});
	} catch (err: unknown) {
		const error = err as Error;
		console.error("[Favorites API] DELETE error:", error.message);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
