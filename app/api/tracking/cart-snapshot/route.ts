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

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { session_id, user_id, cart_items, total_value, item_count } = body;

		if (!session_id || !cart_items || total_value === undefined) {
			return NextResponse.json(
				{ success: false, error: "Invalid request" },
				{ status: 400 }
			);
		}

		// Get session UUID
		const { data: session } = await supabaseAdmin
			.from("user_sessions")
			.select("id")
			.eq("session_id", session_id)
			.single();

		if (!session) {
			return NextResponse.json(
				{ success: false, error: "Session not found" },
				{ status: 404 }
			);
		}

		// Create cart snapshot
		const { data, error } = await supabaseAdmin
			.from("cart_snapshots")
			.insert({
				session_id: session.id,
				user_id: user_id || null,
				cart_items: cart_items,
				total_value: total_value,
				item_count: item_count,
			})
			.select("id")
			.single();

		if (error) {
			console.error("[Cart Snapshot API] Insert error:", error);
			return NextResponse.json(
				{ success: false, error: "Failed to create snapshot" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			snapshot_id: data.id,
		});
	} catch (error) {
		console.error("[Cart Snapshot API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

