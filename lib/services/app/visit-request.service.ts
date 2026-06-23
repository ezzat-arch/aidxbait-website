import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserBySupabaseId } from "@/lib/services/app/user.service";
import { TIME_SLOTS, TimeSlot } from "@/lib/services/app/therapist.service";

/**
 * Patient-side home-visit requests.
 *
 * Flow consistency across apps:
 * - Patient creates a request here with is_accepted = true so APPROVED
 *   therapists covering the area see it immediately in the therapist app
 *   (listIncomingRequests filters on is_accepted = true).
 * - A therapist accepting creates a `visits` row; the patient sees the
 *   visit status (scheduled -> in_progress -> done) and therapist info here.
 */

export class VisitRequestNotFoundError extends Error {
	constructor() {
		super("Request not found.");
		this.name = "VisitRequestNotFoundError";
	}
}

export class RequestNotCancellableError extends Error {
	constructor(status: string) {
		super(
			`This request can no longer be cancelled (visit is ${status}). Please contact support.`
		);
		this.name = "RequestNotCancellableError";
	}
}

export class NoTherapistsInAreaError extends Error {
	constructor() {
		super(
			"No therapists currently cover this area. Please pick another area or try again later."
		);
		this.name = "NoTherapistsInAreaError";
	}
}

export class TherapistNotInAreaError extends Error {
	constructor() {
		super(
			"The selected therapist does not cover this area or is not available. Please pick another therapist or send a general request."
		);
		this.name = "TherapistNotInAreaError";
	}
}

// ---------------------------------------------------------------------------
// Therapists available in an area (for the patient's "choose doctor" picker)
// ---------------------------------------------------------------------------

export async function getAreaTherapists(
	locationId: number,
	specialtyId?: number
) {
	let query = supabaseAdmin
		.from("therapist_locations")
		.select(
			`
			therapists!inner (
				id, specialty, specialty_id, bio, gender, experience_years,
				account_status, is_available, rating_avg, rating_count,
				users (first_name, last_name, image_url)
			)
			`
		)
		.eq("location_id", locationId)
		.eq("therapists.account_status", "approved")
		.eq("therapists.is_available", true);

	if (specialtyId) {
		query = query.eq("therapists.specialty_id", specialtyId);
	}

	const { data, error } = await query;
	if (error) throw error;

	return (data ?? [])
		.map((row) => {
			const t = row.therapists as unknown as {
				id: number;
				specialty: string | null;
				specialty_id: number | null;
				bio: string | null;
				gender: string | null;
				experience_years: number | null;
				rating_avg: number | null;
				rating_count: number | null;
				users: {
					first_name: string | null;
					last_name: string | null;
					image_url: string | null;
				} | null;
			};
			return {
				id: t.id,
				specialty: t.specialty,
				specialty_id: t.specialty_id ?? null,
				bio: t.bio,
				gender: t.gender,
				experience_years: t.experience_years,
				rating_avg: Number(t.rating_avg) || 0,
				rating_count: t.rating_count || 0,
				first_name: t.users?.first_name ?? null,
				last_name: t.users?.last_name ?? null,
				image_url: t.users?.image_url ?? null,
			};
		})
		.sort((a, b) =>
			`${a.first_name} ${a.last_name}`.localeCompare(
				`${b.first_name} ${b.last_name}`
			)
		);
}

// ---------------------------------------------------------------------------
// Availability: which days/slots have at least one approved therapist free
// ---------------------------------------------------------------------------

interface WeeklyRow {
	therapist_id: number;
	day_of_week: number;
	time_slot: TimeSlot;
	is_available: boolean;
}

interface OverrideRow {
	therapist_id: number;
	override_date: string;
	time_slot: TimeSlot | null;
	is_available: boolean;
}

export interface DayAvailability {
	date: string; // YYYY-MM-DD
	day_of_week: number; // 0 = Sunday
	slots: Record<TimeSlot, boolean>;
}

function toDateString(d: Date): string {
	return d.toISOString().slice(0, 10);
}

/**
 * Is this therapist available for (date, dow, slot)?
 * Precedence: slot override > whole-day override > weekly pattern.
 * A therapist with NO weekly rows at all defaults to available (they simply
 * haven't configured a schedule yet).
 */
function therapistFreeForSlot(
	therapistId: number,
	date: string,
	dow: number,
	slot: TimeSlot,
	weeklyByTherapist: Map<number, WeeklyRow[]>,
	overridesByTherapist: Map<number, OverrideRow[]>
): boolean {
	const overrides = (overridesByTherapist.get(therapistId) ?? []).filter(
		(o) => o.override_date === date
	);

	const slotOverride = overrides.find((o) => o.time_slot === slot);
	if (slotOverride) return slotOverride.is_available;

	const dayOverride = overrides.find((o) => o.time_slot === null);
	if (dayOverride) return dayOverride.is_available;

	const weekly = weeklyByTherapist.get(therapistId) ?? [];
	if (weekly.length === 0) return true; // no schedule configured yet

	const row = weekly.find((w) => w.day_of_week === dow && w.time_slot === slot);
	return row ? row.is_available : false;
}

/**
 * For a location, compute per-day / per-slot availability for the next
 * `days` days based on approved therapists covering that area.
 * Pass `therapistId` to get ONE specific doctor's availability instead
 * (used when the patient picks a doctor); a therapist who doesn't cover
 * the area yields therapist_count = 0.
 */
export async function getAreaAvailability(
	locationId: number,
	days = 14,
	therapistId?: number,
	specialtyId?: number
): Promise<{ therapist_count: number; days: DayAvailability[] }> {
	// Approved, active therapists covering this location
	let coverageQuery = supabaseAdmin
		.from("therapist_locations")
		.select(
			"therapist_id, therapists!inner (id, account_status, is_available, specialty_id)"
		)
		.eq("location_id", locationId)
		.eq("therapists.account_status", "approved")
		.eq("therapists.is_available", true);

	if (therapistId) {
		coverageQuery = coverageQuery.eq("therapist_id", therapistId);
	}
	if (specialtyId) {
		coverageQuery = coverageQuery.eq("therapists.specialty_id", specialtyId);
	}

	const { data: coverage, error: coverageError } = await coverageQuery;
	if (coverageError) throw coverageError;

	const therapistIds = (coverage ?? []).map((c) => c.therapist_id);

	const start = new Date();
	const result: DayAvailability[] = [];

	if (therapistIds.length === 0) {
		for (let i = 0; i < days; i++) {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			result.push({
				date: toDateString(d),
				day_of_week: d.getDay(),
				slots: { "8:00-12:00": false, "12:00-16:00": false, "16:00-20:00": false },
			});
		}
		return { therapist_count: 0, days: result };
	}

	const end = new Date(start);
	end.setDate(start.getDate() + days);

	const [{ data: weekly, error: weeklyError }, { data: overrides, error: overridesError }] =
		await Promise.all([
			supabaseAdmin
				.from("therapist_weekly_availability")
				.select("therapist_id, day_of_week, time_slot, is_available")
				.in("therapist_id", therapistIds),
			supabaseAdmin
				.from("therapist_schedule_overrides")
				.select("therapist_id, override_date, time_slot, is_available")
				.in("therapist_id", therapistIds)
				.gte("override_date", toDateString(start))
				.lte("override_date", toDateString(end)),
		]);

	if (weeklyError) throw weeklyError;
	if (overridesError) throw overridesError;

	const weeklyByTherapist = new Map<number, WeeklyRow[]>();
	for (const w of (weekly ?? []) as WeeklyRow[]) {
		if (!weeklyByTherapist.has(w.therapist_id))
			weeklyByTherapist.set(w.therapist_id, []);
		weeklyByTherapist.get(w.therapist_id)!.push(w);
	}
	const overridesByTherapist = new Map<number, OverrideRow[]>();
	for (const o of (overrides ?? []) as OverrideRow[]) {
		if (!overridesByTherapist.has(o.therapist_id))
			overridesByTherapist.set(o.therapist_id, []);
		overridesByTherapist.get(o.therapist_id)!.push(o);
	}

	for (let i = 0; i < days; i++) {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		const date = toDateString(d);
		const dow = d.getDay();

		const slots = {} as Record<TimeSlot, boolean>;
		for (const slot of TIME_SLOTS) {
			slots[slot] = therapistIds.some((tid) =>
				therapistFreeForSlot(tid, date, dow, slot, weeklyByTherapist, overridesByTherapist)
			);
		}
		result.push({ date, day_of_week: dow, slots });
	}

	return { therapist_count: therapistIds.length, days: result };
}

// ---------------------------------------------------------------------------
// Create / list / cancel requests
// ---------------------------------------------------------------------------

export interface CreateVisitRequestData {
	location_id: number;
	request_date: string; // YYYY-MM-DD
	time_slot: TimeSlot;
	/** Preferred therapist gender ('Male' | 'Female') — required by schema */
	gender: "Male" | "Female";
	complaint?: string;
	pain_areas?: string[];
	notes?: string;
	/** Direct the request to one specific therapist (must cover the area). */
	preferred_therapist_id?: number;
	/** Optional specialty filter; only matching doctors see a general request. */
	specialty_id?: number;
}

export async function createVisitRequest(
	supabaseId: string,
	data: CreateVisitRequestData
) {
	const user = await getUserBySupabaseId(supabaseId);

	// Refuse up front if nobody can take it (better UX than a dead request).
	// For a directed request this also verifies the chosen therapist is
	// approved, available, and actually covers the selected area. For a
	// general request with a specialty, it checks a matching doctor exists.
	const availability = await getAreaAvailability(
		data.location_id,
		1,
		data.preferred_therapist_id,
		data.preferred_therapist_id ? undefined : data.specialty_id
	);
	if (availability.therapist_count === 0) {
		throw data.preferred_therapist_id
			? new TherapistNotInAreaError()
			: new NoTherapistsInAreaError();
	}

	const { data: request, error } = await supabaseAdmin
		.from("requests")
		.insert([
			{
				patient_id: user.patient_id,
				location_id: data.location_id,
				request_date: data.request_date,
				time_slot: data.time_slot,
				gender: data.gender,
				// Made visible to therapists immediately (no admin review step)
				status: "Accepted",
				queue: "Pending Requests",
				is_accepted: true,
				complaint: data.complaint?.trim() || null,
				pain_areas: data.pain_areas ?? [],
				notes: data.notes?.trim() || null,
				preferred_therapist_id: data.preferred_therapist_id ?? null,
				specialty_id: data.specialty_id ?? null,
			},
		])
		.select("id, request_date, time_slot, status, created_at")
		.single();

	if (error) throw error;
	return request;
}

const MY_REQUEST_SELECT = `
	id, request_date, time_slot, gender, complaint, pain_areas, notes,
	is_archived, created_at, preferred_therapist_id,
	preferred_therapist:preferred_therapist_id (
		id, specialty,
		users (first_name, last_name, image_url)
	),
	locations (id, location_name),
	visits (
		id, status, scheduled_date, time_slot, therapist_notes,
		started_at, completed_at, cancelled_at,
		therapists (
			id, specialty, rating_avg, rating_count,
			users (first_name, last_name, phone_number, image_url)
		)
	)
`;

/**
 * The patient's requests, newest first, each with a derived display status:
 *   pending   - no therapist accepted yet
 *   scheduled / in_progress / done / cancelled - from the visit
 */
export async function listMyRequests(supabaseId: string) {
	const user = await getUserBySupabaseId(supabaseId);

	const { data, error } = await supabaseAdmin
		.from("requests")
		.select(MY_REQUEST_SELECT)
		.eq("patient_id", user.patient_id)
		.eq("is_archived", false)
		.order("created_at", { ascending: false });

	if (error) throw error;

	return (data ?? []).map((r) => {
		const visit = Array.isArray(r.visits) ? r.visits[0] ?? null : r.visits;
		return {
			...r,
			visits: undefined,
			visit,
			display_status: visit ? visit.status : "pending",
		};
	});
}

/**
 * Cancel a request. Allowed while it's pending or the visit is still
 * 'scheduled'. The request is archived and any scheduled visit cancelled,
 * so the therapist no longer sees it as upcoming.
 */
export async function cancelVisitRequest(
	supabaseId: string,
	requestId: number
) {
	const user = await getUserBySupabaseId(supabaseId);

	const { data: request, error } = await supabaseAdmin
		.from("requests")
		.select("id, patient_id, is_archived, visits (id, status)")
		.eq("id", requestId)
		.eq("patient_id", user.patient_id)
		.single();

	if (error) {
		if (error.code === "PGRST116") throw new VisitRequestNotFoundError();
		throw error;
	}

	const visit = Array.isArray(request.visits)
		? request.visits[0] ?? null
		: request.visits;

	if (visit && visit.status !== "scheduled" && visit.status !== "cancelled") {
		throw new RequestNotCancellableError(visit.status);
	}

	if (visit && visit.status === "scheduled") {
		const { error: visitError } = await supabaseAdmin
			.from("visits")
			.update({
				status: "cancelled",
				cancelled_at: new Date().toISOString(),
				cancel_reason: "Cancelled by patient",
			})
			.eq("id", visit.id);
		if (visitError) throw visitError;
	}

	const { error: archiveError } = await supabaseAdmin
		.from("requests")
		.update({ is_archived: true })
		.eq("id", requestId);
	if (archiveError) throw archiveError;
}
