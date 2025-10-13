import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CartSyncRequest } from "@/lib/store-types";

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
		const body: CartSyncRequest = await request.json();
		const { userId, items } = body;

		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "User ID required" },
				{ status: 400 }
			);
		}

		const { error: deleteError } = await supabaseAdmin
			.from("user_cart")
			.delete()
			.eq("user_id", userId);

		if (deleteError) {
			console.error("[Cart Sync API] Error deleting cart:", deleteError);
			return NextResponse.json(
				{ success: false, error: "Failed to clear cart" },
				{ status: 500 }
			);
		}

		if (items && items.length > 0) {
			const cartRecords = items.map((item) => ({
				user_id: userId,
				product_id: item.product_id,
				quantity: item.quantity,
			}));

			const { error: insertError } = await supabaseAdmin
				.from("user_cart")
				.insert(cartRecords);

			if (insertError) {
				console.error("[Cart Sync API] Error inserting items:", insertError);
				return NextResponse.json(
					{ success: false, error: "Failed to sync cart items" },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Cart Sync API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
