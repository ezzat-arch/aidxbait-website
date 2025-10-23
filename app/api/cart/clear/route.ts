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

/**
 * DELETE /api/cart/clear
 * Clears all cart items for a specific user
 * This is used for immediate cart clearing (e.g., after order creation)
 */
export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId } = body;

		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "User ID required" },
				{ status: 400 }
			);
		}

		console.log("[Cart Clear API] Clearing cart for user:", userId);

		const { error: deleteError } = await supabaseAdmin
			.from("user_cart")
			.delete()
			.eq("user_id", userId);

		if (deleteError) {
			console.error("[Cart Clear API] Error clearing cart:", deleteError);
			return NextResponse.json(
				{ success: false, error: "Failed to clear cart" },
				{ status: 500 }
			);
		}

		console.log("[Cart Clear API] Cart cleared successfully for user:", userId);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Cart Clear API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
