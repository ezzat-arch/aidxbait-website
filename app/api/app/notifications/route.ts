import { NextRequest, NextResponse } from "next/server";
import {
	listNotifications,
	NotificationUserNotFoundError,
} from "@/lib/services/app/notification.service";
import {
	errorJson,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/notifications?supabaseId=<uuid>&limit=<n>
 *
 * Latest in-app notifications for the user (patient OR therapist) plus the
 * unread count for the bell badge.
 * Success: { success: true, data: { notifications: [...], unread_count } }
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");
		const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const data = await listNotifications(supabaseId, limit);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		if (err instanceof NotificationUserNotFoundError) {
			return errorJson("UserNotFoundError", err.message, 404);
		}
		console.error("[notifications] error", err);
		return errorJson(
			"DatabaseError",
			(err as Error)?.message || "An unexpected error occurred",
			500
		);
	}
}
