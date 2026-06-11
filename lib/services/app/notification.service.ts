import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * In-app notifications, shared by the patient and therapist apps.
 * Rows are created automatically by DB triggers (migration 006) on
 * request/visit events; this service only reads and marks them.
 */

export class NotificationUserNotFoundError extends Error {
	constructor() {
		super("User account not found.");
		this.name = "NotificationUserNotFoundError";
	}
}

async function getUserIdBySupabaseId(supabaseId: string): Promise<number> {
	const { data, error } = await supabaseAdmin
		.from("users")
		.select("id")
		.eq("supabase_id", supabaseId)
		.single();

	if (error) {
		if (error.code === "PGRST116") throw new NotificationUserNotFoundError();
		throw error;
	}
	return data.id;
}

export interface NotificationRow {
	id: number;
	type: string;
	title: string;
	title_ar: string;
	body: string;
	body_ar: string;
	reference_type: string | null;
	reference_id: number | null;
	is_read: boolean;
	created_at: string;
}

export async function listNotifications(
	supabaseId: string,
	limit = 50
): Promise<{ notifications: NotificationRow[]; unread_count: number }> {
	const userId = await getUserIdBySupabaseId(supabaseId);

	const [{ data, error }, { count, error: countError }] = await Promise.all([
		supabaseAdmin
			.from("notifications")
			.select(
				"id, type, title, title_ar, body, body_ar, reference_type, reference_id, is_read, created_at"
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(limit),
		supabaseAdmin
			.from("notifications")
			.select("id", { count: "exact", head: true })
			.eq("user_id", userId)
			.eq("is_read", false),
	]);

	if (error) throw error;
	if (countError) throw countError;

	return { notifications: data ?? [], unread_count: count ?? 0 };
}

/**
 * Mark notifications read. Pass specific ids, or omit to mark ALL read.
 */
export async function markNotificationsRead(
	supabaseId: string,
	ids?: number[]
): Promise<void> {
	const userId = await getUserIdBySupabaseId(supabaseId);

	let query = supabaseAdmin
		.from("notifications")
		.update({ is_read: true })
		.eq("user_id", userId)
		.eq("is_read", false);

	if (ids && ids.length > 0) {
		query = query.in("id", ids);
	}

	const { error } = await query;
	if (error) throw error;
}
