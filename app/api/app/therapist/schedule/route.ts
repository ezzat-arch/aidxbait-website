import { NextRequest, NextResponse } from "next/server";
import {
	getSchedule,
	updateSchedule,
	WeeklySlot,
	ScheduleOverride,
	TIME_SLOTS,
} from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/therapist/schedule?supabaseId=<uuid>
 *
 * Returns { weekly: WeeklySlot[], overrides: ScheduleOverride[] }.
 * `weekly` is the recurring pattern; `overrides` are specific dates the
 * therapist switched on/off (vacations, extra days).
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const data = await getSchedule(supabaseId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}

/**
 * PUT /api/app/therapist/schedule
 *
 * Body: {
 *   supabase_id,
 *   weekly?:    [{ day_of_week: 0-6, time_slot, is_available }],   // replaces all
 *   overrides?: [{ override_date: 'YYYY-MM-DD', time_slot|null, is_available, reason? }]
 * }
 */
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, weekly, overrides } = body as {
			supabase_id: string;
			weekly?: WeeklySlot[];
			overrides?: ScheduleOverride[];
		};

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}
		if (weekly === undefined && overrides === undefined) {
			return validationError("Provide `weekly` and/or `overrides` to update");
		}

		if (weekly) {
			for (const slot of weekly) {
				if (
					slot.day_of_week < 0 ||
					slot.day_of_week > 6 ||
					!TIME_SLOTS.includes(slot.time_slot)
				) {
					return validationError(
						`Invalid weekly slot: day_of_week must be 0-6 and time_slot one of ${TIME_SLOTS.join(", ")}`
					);
				}
			}
		}

		if (overrides) {
			for (const override of overrides) {
				if (!/^\d{4}-\d{2}-\d{2}$/.test(override.override_date)) {
					return validationError(
						"Invalid override_date, expected YYYY-MM-DD"
					);
				}
				if (
					override.time_slot !== null &&
					override.time_slot !== undefined &&
					!TIME_SLOTS.includes(override.time_slot)
				) {
					return validationError(
						`Invalid time_slot, expected null or one of ${TIME_SLOTS.join(", ")}`
					);
				}
			}
		}

		const data = await updateSchedule(supabase_id, { weekly, overrides });
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
