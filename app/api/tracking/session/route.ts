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
		const { session_id, user_id, user_agent, referrer_url, action } = body;

		if (!session_id) {
			return NextResponse.json(
				{ success: false, error: "session_id is required" },
				{ status: 400 }
			);
		}

		// Handle heartbeat (just update last_activity_at)
		if (action === "heartbeat") {
			const { error } = await supabaseAdmin
				.from("user_sessions")
				.update({
					last_activity_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.eq("session_id", session_id);

			if (error) {
				console.error("[Session API] Heartbeat error:", error);
			}

			return NextResponse.json({ success: true });
		}

		// Handle user linking
		if (action === "link_user") {
			const { error } = await supabaseAdmin
				.from("user_sessions")
				.update({
					user_id: user_id,
					last_activity_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})
				.eq("session_id", session_id);

			if (error) {
				console.error("[Session API] Link user error:", error);
				return NextResponse.json(
					{ success: false, error: "Failed to link user" },
					{ status: 500 }
				);
			}

			return NextResponse.json({ success: true });
		}

		// Initialize or get existing session
		const { data: existingSession } = await supabaseAdmin
			.from("user_sessions")
			.select("id, session_id")
			.eq("session_id", session_id)
			.single();

		if (existingSession) {
			// Update existing session
			const { error } = await supabaseAdmin
				.from("user_sessions")
				.update({
					user_id: user_id || null,
					last_activity_at: new Date().toISOString(),
					is_active: true,
					updated_at: new Date().toISOString(),
				})
				.eq("session_id", session_id);

			if (error) {
				console.error("[Session API] Update session error:", error);
			}

			return NextResponse.json({
				success: true,
				session_uuid: existingSession.id,
			});
		}

		// Create new session
		const { data: newSession, error: createError } = await supabaseAdmin
			.from("user_sessions")
			.insert({
				session_id,
				user_id: user_id || null,
				user_agent: user_agent || null,
				is_active: true,
			})
			.select("id")
			.single();

		if (createError) {
			console.error("[Session API] Create session error:", createError);
			return NextResponse.json(
				{ success: false, error: "Failed to create session" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			session_uuid: newSession.id,
		});
	} catch (error) {
		console.error("[Session API] Unexpected error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

