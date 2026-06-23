import { NextRequest, NextResponse } from "next/server";
import {
	markNotificationsRead,
	NotificationUserNotFoundError,
} from "@/lib/services/app/notification.service";
import {
	errorJson,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * POST /api/app/notifications/read
 *
 * Mark notifications as read.
 * Body: { supabase_id, ids?: number[] }  — omit ids to mark ALL read.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, ids } = body as {
			supabase_id: string;
			ids?: number[];
		};

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}
		if (
			ids !== undefined &&
			(!Array.isArray(ids) || ids.some((id) => !Number(id)))
		) {
			return validationError("ids must be an array of notification ids");
		}

		await markNotificationsRead(supabase_id, ids);
		return NextResponse.json({ success: true });
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
