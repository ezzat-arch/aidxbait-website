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

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "User ID required" },
				{ status: 400 }
			);
		}

		const { data: cartItems, error: cartError } = await supabaseAdmin
			.from("user_cart")
			.select(
				`
				id,
				product_id,
				quantity,
				added_at,
				updated_at,
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
					is_oos,
					is_for_rent,
					rent_term,
					tags,
					created_at,
					updated_at,
					product_images (
						id,
						product_id,
						image_url,
						is_main,
						created_at,
						updated_at
					)
				)
			`
			)
			.eq("user_id", userId);

		if (cartError) {
			console.error("[Cart API] Error fetching cart:", cartError);
			return NextResponse.json(
				{ success: false, error: "Failed to fetch cart" },
				{ status: 500 }
			);
		}

		const items = (cartItems || []).map((item: any) => ({
			product: {
				...item.products,
				images: item.products.product_images || [],
				joints: [],
				reviews: [],
				rating: 0,
				reviewCount: 0,
			},
			quantity: item.quantity,
		}));

		return NextResponse.json({ success: true, items });
	} catch (error) {
		console.error("[Cart API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
