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

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const productId = parseInt(params.id);
		const body = await request.json();
		const { userId, quantity } = body;

		if (!userId || !quantity) {
			return NextResponse.json(
				{ success: false, error: "User ID and quantity required" },
				{ status: 400 }
			);
		}

		if (quantity <= 0) {
			return NextResponse.json(
				{ success: false, error: "Quantity must be greater than 0" },
				{ status: 400 }
			);
		}

		const { data: existing, error: checkError } = await supabaseAdmin
			.from("user_cart")
			.select("id")
			.eq("user_id", userId)
			.eq("product_id", productId)
			.single();

		if (checkError && checkError.code !== "PGRST116") {
			console.error("[Cart Update API] Error checking item:", checkError);
			return NextResponse.json(
				{ success: false, error: "Failed to check cart item" },
				{ status: 500 }
			);
		}

		if (existing) {
			const { error: updateError } = await supabaseAdmin
				.from("user_cart")
				.update({ quantity, updated_at: new Date().toISOString() })
				.eq("user_id", userId)
				.eq("product_id", productId);

			if (updateError) {
				console.error("[Cart Update API] Error updating item:", updateError);
				return NextResponse.json(
					{ success: false, error: "Failed to update cart item" },
					{ status: 500 }
				);
			}
		} else {
			const { error: insertError } = await supabaseAdmin
				.from("user_cart")
				.insert({
					user_id: userId,
					product_id: productId,
					quantity,
				});

			if (insertError) {
				console.error("[Cart Update API] Error inserting item:", insertError);
				return NextResponse.json(
					{ success: false, error: "Failed to add cart item" },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Cart Update API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const productId = parseInt(params.id);
		const body = await request.json();
		const { userId } = body;

		if (!userId) {
			return NextResponse.json(
				{ success: false, error: "User ID required" },
				{ status: 400 }
			);
		}

		const { error: deleteError } = await supabaseAdmin
			.from("user_cart")
			.delete()
			.eq("user_id", userId)
			.eq("product_id", productId);

		if (deleteError) {
			console.error("[Cart Delete API] Error deleting item:", deleteError);
			return NextResponse.json(
				{ success: false, error: "Failed to delete cart item" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[Cart Delete API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}
