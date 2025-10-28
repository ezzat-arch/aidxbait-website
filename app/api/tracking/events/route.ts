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
		const { session_id, user_id, events } = body;

		if (!session_id || !events || !Array.isArray(events)) {
			return NextResponse.json(
				{ success: false, error: "Invalid request" },
				{ status: 400 }
			);
		}

		// Get session UUID from session_id
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

		const sessionUuid = session.id;

		// Process each event
		const productViews: any[] = [];
		const cartEvents: any[] = [];
		const checkoutEvents: any[] = [];

		for (const event of events) {
			switch (event.type) {
				case "product_view":
					productViews.push({
						session_id: sessionUuid,
						user_id: user_id || null,
						product_id: event.product_id,
						referrer_url: event.referrer_url || null,
					});
					break;

				case "product_view_duration":
					// Update existing product view with duration
					await supabaseAdmin
						.from("product_views")
						.update({
							duration_seconds: event.duration_seconds,
						})
						.eq("session_id", sessionUuid)
						.eq("product_id", event.product_id)
						.order("viewed_at", { ascending: false })
						.limit(1);
					break;

				case "cart_event":
					cartEvents.push({
						session_id: sessionUuid,
						user_id: user_id || null,
						event_type: event.event_type,
						product_id: event.product_id || null,
						quantity: event.quantity || null,
						rental_weeks: event.rental_weeks || null,
						previous_quantity: event.previous_quantity || null,
						cart_value_at_event: event.cart_value_at_event || null,
						cart_item_count: event.cart_item_count || null,
					});
					break;

				case "checkout_event":
					checkoutEvents.push({
						session_id: sessionUuid,
						user_id: user_id || null,
						event_type: event.event_type,
						order_id: event.order_id || null,
						cart_value: event.cart_value || null,
						cart_item_count: event.cart_item_count || null,
						payment_method: event.payment_method || null,
						failure_reason: event.failure_reason || null,
					});
					break;
			}
		}

		// Batch insert all events
		const insertPromises: Promise<any>[] = [];

		if (productViews.length > 0) {
			insertPromises.push(
				supabaseAdmin.from("product_views").insert(productViews)
			);
		}

		if (cartEvents.length > 0) {
			insertPromises.push(supabaseAdmin.from("cart_events").insert(cartEvents));
		}

		if (checkoutEvents.length > 0) {
			insertPromises.push(
				supabaseAdmin.from("checkout_events").insert(checkoutEvents)
			);
		}

		const results = await Promise.allSettled(insertPromises);

		// Check for errors
		const errors = results.filter((r) => r.status === "rejected");
		if (errors.length > 0) {
			console.error("[Events API] Some inserts failed:", errors);
		}

		return NextResponse.json({
			success: true,
			processed: events.length,
		});
	} catch (error) {
		console.error("[Events API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

