import { Session } from "@supabase/supabase-js";
import { supabaseAdmin, supabaseAuth } from "@/lib/supabase/admin";

/**
 * Custom error classes for therapist scenarios
 */
export class TherapistNotFoundError extends Error {
	constructor() {
		super("Therapist account not found. Please make sure you have signed up.");
		this.name = "TherapistNotFoundError";
	}
}

export class NonTherapistUserError extends Error {
	constructor() {
		super(
			"You don't have a therapist account on this platform. Please contact support if you believe this is an error."
		);
		this.name = "NonTherapistUserError";
	}
}

export class TherapistNotApprovedError extends Error {
	constructor(status: string) {
		super(
			`Your account is not approved yet (status: ${status}). You will be able to receive requests once an admin approves your account.`
		);
		this.name = "TherapistNotApprovedError";
	}
}

export class AuthUserNotReadyError extends Error {
	constructor() {
		super(
			"We couldn't finish creating your account. Please confirm your email if required, then try signing in. If the problem continues, contact support."
		);
		this.name = "AuthUserNotReadyError";
	}
}

export class EmailAlreadyRegisteredError extends Error {
	constructor() {
		super(
			"An account with this email already exists. Please sign in instead, or use a different email."
		);
		this.name = "EmailAlreadyRegisteredError";
	}
}

export class RequestNotFoundError extends Error {
	constructor() {
		super("Request not found or no longer available.");
		this.name = "RequestNotFoundError";
	}
}

export class VisitNotFoundError extends Error {
	constructor() {
		super("Visit not found.");
		this.name = "VisitNotFoundError";
	}
}

export type TimeSlot = "8:00-12:00" | "12:00-16:00" | "16:00-20:00";

export const TIME_SLOTS: TimeSlot[] = [
	"8:00-12:00",
	"12:00-16:00",
	"16:00-20:00",
];

export interface TherapistProfile {
	user_id: number;
	therapist_id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	image_url: string;
	specialty: string | null;
	specialty_id: number | null;
	bio: string | null;
	gender: string;
	experience_years: number | null;
	account_status: string;
	rejection_reason: string | null;
	is_available: boolean;
	locations: { id: number; location_name: string }[];
}

/**
 * Fetch a therapist (joined with their user row) by Supabase Auth UUID.
 */
export async function getTherapistBySupabaseId(
	supabaseId: string
): Promise<TherapistProfile> {
	const { data: user, error: userError } = await supabaseAdmin
		.from("users")
		.select(
			"id, first_name, last_name, email, phone_number, image_url, user_type"
		)
		.eq("supabase_id", supabaseId)
		.single();

	if (userError) {
		if (userError.code === "PGRST116") {
			throw new TherapistNotFoundError();
		}
		throw userError;
	}

	if (user.user_type !== "therapist") {
		throw new NonTherapistUserError();
	}

	const { data: therapist, error: therapistError } = await supabaseAdmin
		.from("therapists")
		.select(
			"id, specialty, specialty_id, bio, gender, experience_years, account_status, rejection_reason, is_available"
		)
		.eq("user_id", user.id)
		.single();

	if (therapistError) {
		if (therapistError.code === "PGRST116") {
			throw new TherapistNotFoundError();
		}
		throw therapistError;
	}

	const { data: locationRows, error: locationsError } = await supabaseAdmin
		.from("therapist_locations")
		.select("locations (id, location_name)")
		.eq("therapist_id", therapist.id);

	if (locationsError) {
		throw locationsError;
	}

	const locations = (locationRows ?? [])
		.map((row) => row.locations as unknown as { id: number; location_name: string })
		.filter(Boolean);

	return {
		user_id: user.id,
		therapist_id: therapist.id,
		first_name: user.first_name,
		last_name: user.last_name,
		email: user.email,
		phone_number: user.phone_number,
		image_url: user.image_url,
		specialty: therapist.specialty,
		specialty_id: therapist.specialty_id ?? null,
		bio: therapist.bio,
		gender: therapist.gender,
		experience_years: therapist.experience_years,
		account_status: therapist.account_status,
		rejection_reason: therapist.rejection_reason,
		is_available: therapist.is_available,
		locations,
	};
}

export interface CreateTherapistData {
	supabase_id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	image_url?: string;
}

export interface SignUpTherapistData {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	// Optional professional profile captured on the signup form.
	specialty_id?: number | null;
	specialty?: string;
	bio?: string;
	gender?: string;
	experience_years?: number;
	location_ids?: number[];
}

export interface SignUpTherapistResult {
	session: Session;
	profile: TherapistProfile;
}

/**
 * Sign up a new therapist entirely server-side (mirrors the patient flow in
 * auth.service.ts). The auth user is created with the service role and
 * auto-confirmed, so the project-wide "Confirm email" setting does NOT matter
 * — the therapist gets a session immediately and never needs an OTP screen.
 *
 * Steps (atomic-ish, with rollback):
 *   1. admin.createUser({ email_confirm: true })
 *   2. insert users + therapists rows
 *   3. signInWithPassword to mint a session
 */
export async function signUpTherapist(
	data: SignUpTherapistData
): Promise<SignUpTherapistResult> {
	const {
		email,
		password,
		first_name,
		last_name,
		phone_number,
		specialty_id,
		specialty,
		bio,
		gender,
		experience_years,
		location_ids,
	} = data;

	// Step 1: create the auth user, auto-confirmed.
	const { data: authData, error: authError } =
		await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { first_name, last_name, phone_number },
		});

	if (authError || !authData.user) {
		if (
			authError?.message?.toLowerCase().includes("already") ||
			authError?.status === 422
		) {
			throw new EmailAlreadyRegisteredError();
		}
		throw new Error(authError?.message || "Failed to create auth user");
	}

	const supabaseId = authData.user.id;

	try {
		// Step 2: create the users + therapists rows.
		await createTherapist({
			supabase_id: supabaseId,
			first_name,
			last_name,
			email,
			phone_number,
		});

		// Step 2b: persist the professional profile + covered areas captured on
		// the signup form, so Specialty / Experience / Areas are saved up front.
		const profileUpdates: UpdateTherapistData = {};
		if (specialty_id) profileUpdates.specialty_id = specialty_id;
		else if (specialty?.trim()) profileUpdates.specialty = specialty.trim();
		if (bio?.trim()) profileUpdates.bio = bio.trim();
		if (gender) profileUpdates.gender = gender;
		if (typeof experience_years === "number" && !Number.isNaN(experience_years))
			profileUpdates.experience_years = experience_years;
		if (Array.isArray(location_ids) && location_ids.length > 0)
			profileUpdates.location_ids = location_ids;

		if (Object.keys(profileUpdates).length > 0) {
			await updateTherapist(supabaseId, profileUpdates);
		}

		// Step 3: sign in to mint a session for the app.
		const { data: signInData, error: signInError } =
			await supabaseAuth.auth.signInWithPassword({ email, password });

		if (signInError || !signInData.session) {
			throw new Error(
				signInError?.message || "Failed to create a session after sign up"
			);
		}

		const profile = await getTherapistBySupabaseId(supabaseId);
		return { session: signInData.session, profile };
	} catch (error) {
		// Roll back the auth user so the email is free to retry.
		await supabaseAdmin.auth.admin.deleteUser(supabaseId);
		throw error;
	}
}

/**
 * Create the users + therapists rows for a freshly registered auth user.
 * Account starts in `pending_documents`.
 */
export async function createTherapist(data: CreateTherapistData) {
	// Idempotent: a previous attempt may have created the users and/or
	// therapists row (e.g. the request failed after a partial insert, or the
	// app retried). Reuse the existing rows instead of erroring.
	const { data: existingUser, error: existingUserError } = await supabaseAdmin
		.from("users")
		.select("id, user_type")
		.eq("supabase_id", data.supabase_id)
		.maybeSingle();

	if (existingUserError) {
		throw existingUserError;
	}

	let userId: number;

	if (existingUser) {
		userId = existingUser.id;
		// If an earlier flow created them as a different type, correct it.
		if (existingUser.user_type !== "therapist") {
			const { error } = await supabaseAdmin
				.from("users")
				.update({ user_type: "therapist" })
				.eq("id", userId);
			if (error) throw error;
		}
	} else {
		// Guard: the app may send a supabase_id that does not correspond to a
		// real auth user. This happens when "Confirm email" is ON and the email
		// already exists — Supabase signUp then returns an obfuscated fake user
		// (anti-enumeration) with an id that has no row in auth.users.
		const { data: authLookup } = await supabaseAdmin.auth.admin.getUserById(
			data.supabase_id
		);
		if (!authLookup?.user) {
			// Is the email already taken by a real auth account?
			const { data: byEmail } = await supabaseAdmin
				.from("users")
				.select("id")
				.eq("email", data.email)
				.maybeSingle();
			if (byEmail) {
				throw new EmailAlreadyRegisteredError();
			}
			throw new AuthUserNotReadyError();
		}

		const { data: userData, error: userError } = await supabaseAdmin
			.from("users")
			.insert([
				{
					first_name: data.first_name,
					last_name: data.last_name,
					email: data.email,
					supabase_id: data.supabase_id,
					phone_number: data.phone_number,
					image_url: data.image_url || "",
					user_type: "therapist",
					is_website_user: false,
				},
			])
			.select("id")
			.single();

		if (userError) {
			// 23503 here means users.supabase_id -> auth.users(id) failed: the
			// auth account isn't committed yet (usually email confirmation is on).
			if (userError.code === "23503") {
				throw new AuthUserNotReadyError();
			}
			throw userError;
		}
		userId = userData.id;
	}

	// Reuse an existing therapist row if present.
	const { data: existingTherapist } = await supabaseAdmin
		.from("therapists")
		.select("id")
		.eq("user_id", userId)
		.maybeSingle();

	if (existingTherapist) {
		return { user_id: userId, therapist_id: existingTherapist.id };
	}

	const { data: therapistData, error: therapistError } = await supabaseAdmin
		.from("therapists")
		.insert([{ user_id: userId }])
		.select("id")
		.single();

	if (therapistError) {
		// Only roll back the user if we created it in this call.
		if (!existingUser) {
			await supabaseAdmin.from("users").delete().eq("id", userId);
		}
		throw therapistError;
	}

	return { user_id: userId, therapist_id: therapistData.id };
}

export interface UpdateTherapistData {
	first_name?: string;
	last_name?: string;
	image_url?: string;
	/** Managed specialty id (preferred). The text `specialty` is kept in sync. */
	specialty_id?: number | null;
	/** Legacy free-text specialty; still accepted for back-compat. */
	specialty?: string;
	bio?: string;
	gender?: string;
	experience_years?: number;
	is_available?: boolean;
	location_ids?: number[];
	/** Set true when the therapist finished uploading docs to move to review */
	submit_for_review?: boolean;
}

/** Look up a specialty's display name by id (null if not found / null id). */
async function specialtyNameById(
	specialtyId: number | null | undefined
): Promise<string | null> {
	if (!specialtyId) return null;
	const { data } = await supabaseAdmin
		.from("specialties")
		.select("name")
		.eq("id", specialtyId)
		.maybeSingle();
	return data?.name ?? null;
}

/**
 * Update therapist profile (users row, therapists row, coverage areas).
 */
export async function updateTherapist(
	supabaseId: string,
	data: UpdateTherapistData
): Promise<TherapistProfile> {
	const profile = await getTherapistBySupabaseId(supabaseId);

	const userUpdates: Record<string, unknown> = {};
	if (data.first_name !== undefined) userUpdates.first_name = data.first_name;
	if (data.last_name !== undefined) userUpdates.last_name = data.last_name;
	if (data.image_url !== undefined) userUpdates.image_url = data.image_url;

	if (Object.keys(userUpdates).length > 0) {
		const { error } = await supabaseAdmin
			.from("users")
			.update(userUpdates)
			.eq("id", profile.user_id);
		if (error) throw error;
	}

	const therapistUpdates: Record<string, unknown> = {};
	if (data.specialty_id !== undefined) {
		// Preferred path: set the managed id and mirror its name into the
		// denormalized text column so existing reads keep showing a label.
		therapistUpdates.specialty_id = data.specialty_id;
		therapistUpdates.specialty = await specialtyNameById(data.specialty_id);
	} else if (data.specialty !== undefined) {
		therapistUpdates.specialty = data.specialty;
	}
	if (data.bio !== undefined) therapistUpdates.bio = data.bio;
	if (data.gender !== undefined) therapistUpdates.gender = data.gender;
	if (data.experience_years !== undefined)
		therapistUpdates.experience_years = data.experience_years;
	if (data.is_available !== undefined)
		therapistUpdates.is_available = data.is_available;
	if (
		data.submit_for_review &&
		profile.account_status === "pending_documents"
	) {
		therapistUpdates.account_status = "pending_review";
	}

	if (Object.keys(therapistUpdates).length > 0) {
		const { error } = await supabaseAdmin
			.from("therapists")
			.update(therapistUpdates)
			.eq("id", profile.therapist_id);
		if (error) throw error;
	}

	if (data.location_ids !== undefined) {
		const { error: deleteError } = await supabaseAdmin
			.from("therapist_locations")
			.delete()
			.eq("therapist_id", profile.therapist_id);
		if (deleteError) throw deleteError;

		if (data.location_ids.length > 0) {
			const { error: insertError } = await supabaseAdmin
				.from("therapist_locations")
				.insert(
					data.location_ids.map((location_id) => ({
						therapist_id: profile.therapist_id,
						location_id,
					}))
				);
			if (insertError) throw insertError;
		}
	}

	return getTherapistBySupabaseId(supabaseId);
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export interface AddDocumentData {
	document_type: string;
	file_url: string;
	file_name: string;
	mime_type?: string;
	size_kb?: number;
}

export async function listDocuments(supabaseId: string) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	const { data, error } = await supabaseAdmin
		.from("therapist_documents")
		.select(
			"id, document_type, file_url, file_name, mime_type, size_kb, status, review_notes, created_at"
		)
		.eq("therapist_id", profile.therapist_id)
		.eq("is_deleted", false)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
}

export async function addDocument(supabaseId: string, doc: AddDocumentData) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	const { data, error } = await supabaseAdmin
		.from("therapist_documents")
		.insert([
			{
				therapist_id: profile.therapist_id,
				document_type: doc.document_type,
				file_url: doc.file_url,
				file_name: doc.file_name,
				mime_type: doc.mime_type ?? null,
				size_kb: doc.size_kb ?? null,
			},
		])
		.select("id, document_type, file_url, file_name, status, created_at")
		.single();

	if (error) throw error;
	return data;
}

export async function removeDocument(supabaseId: string, documentId: number) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	const { error } = await supabaseAdmin
		.from("therapist_documents")
		.update({ is_deleted: true })
		.eq("id", documentId)
		.eq("therapist_id", profile.therapist_id);

	if (error) throw error;
}

// ---------------------------------------------------------------------------
// Schedule (weekly availability + date overrides)
// ---------------------------------------------------------------------------

export interface WeeklySlot {
	day_of_week: number; // 0 = Sunday ... 6 = Saturday
	time_slot: TimeSlot;
	is_available: boolean;
}

export interface ScheduleOverride {
	override_date: string; // YYYY-MM-DD
	time_slot: TimeSlot | null; // null = whole day
	is_available: boolean;
	reason?: string | null;
}

export async function getSchedule(supabaseId: string) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	const [{ data: weekly, error: weeklyError }, { data: overrides, error: overridesError }] =
		await Promise.all([
			supabaseAdmin
				.from("therapist_weekly_availability")
				.select("day_of_week, time_slot, is_available")
				.eq("therapist_id", profile.therapist_id)
				.order("day_of_week"),
			supabaseAdmin
				.from("therapist_schedule_overrides")
				.select("id, override_date, time_slot, is_available, reason")
				.eq("therapist_id", profile.therapist_id)
				.gte("override_date", new Date().toISOString().slice(0, 10))
				.order("override_date"),
		]);

	if (weeklyError) throw weeklyError;
	if (overridesError) throw overridesError;

	return { weekly: weekly ?? [], overrides: overrides ?? [] };
}

/**
 * Replace the full weekly availability and/or upsert overrides.
 */
export async function updateSchedule(
	supabaseId: string,
	payload: { weekly?: WeeklySlot[]; overrides?: ScheduleOverride[] }
) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	if (payload.weekly !== undefined) {
		const { error: deleteError } = await supabaseAdmin
			.from("therapist_weekly_availability")
			.delete()
			.eq("therapist_id", profile.therapist_id);
		if (deleteError) throw deleteError;

		if (payload.weekly.length > 0) {
			const { error: insertError } = await supabaseAdmin
				.from("therapist_weekly_availability")
				.insert(
					payload.weekly.map((slot) => ({
						therapist_id: profile.therapist_id,
						day_of_week: slot.day_of_week,
						time_slot: slot.time_slot,
						is_available: slot.is_available,
					}))
				);
			if (insertError) throw insertError;
		}
	}

	if (payload.overrides !== undefined) {
		for (const override of payload.overrides) {
			const { error } = await supabaseAdmin
				.from("therapist_schedule_overrides")
				.upsert(
					{
						therapist_id: profile.therapist_id,
						override_date: override.override_date,
						time_slot: override.time_slot,
						is_available: override.is_available,
						reason: override.reason ?? null,
					},
					{ onConflict: "therapist_id,override_date,time_slot" }
				);
			if (error) throw error;
		}
	}

	return getSchedule(supabaseId);
}

// ---------------------------------------------------------------------------
// Requests (incoming patient home-visit requests)
// ---------------------------------------------------------------------------

function assertApproved(profile: TherapistProfile) {
	if (profile.account_status !== "approved") {
		throw new TherapistNotApprovedError(profile.account_status);
	}
}

const REQUEST_SELECT = `
	id, request_date, time_slot, gender, status, complaint, pain_areas,
	attached_docs, notes, created_at, preferred_therapist_id,
	locations (id, location_name),
	patients (
		id, date_of_birth, gender, blood_type, notes,
		users (first_name, last_name, phone_number, image_url)
	)
`;

/**
 * Pending requests offered to this therapist:
 * accepted-by-admin requests in the therapist's covered areas that
 * don't have a visit yet, plus direct invitations in therapist_notifications.
 */
export async function listIncomingRequests(supabaseId: string) {
	const profile = await getTherapistBySupabaseId(supabaseId);
	assertApproved(profile);

	const locationIds = profile.locations.map((l) => l.id);
	if (locationIds.length === 0) return [];

	// Requests already converted into visits are no longer offered
	const { data: takenRows, error: takenError } = await supabaseAdmin
		.from("visits")
		.select("request_id");
	if (takenError) throw takenError;
	const takenIds = (takenRows ?? []).map((row) => row.request_id);

	// Requests this therapist already declined
	const { data: declinedRows, error: declinedError } = await supabaseAdmin
		.from("therapist_notifications")
		.select("request_id")
		.eq("therapist_id", profile.therapist_id)
		.eq("status", "Rejected");
	if (declinedError) throw declinedError;
	const declinedIds = (declinedRows ?? []).map((row) => row.request_id);

	const excludedIds = [...new Set([...takenIds, ...declinedIds])];

	let query = supabaseAdmin
		.from("requests")
		.select(REQUEST_SELECT)
		.in("location_id", locationIds)
		.eq("is_accepted", true)
		.eq("is_archived", false)
		// General requests (no preferred therapist) plus requests directed
		// specifically to THIS therapist. Directed requests for other
		// therapists are never shown here.
		.or(
			`preferred_therapist_id.is.null,preferred_therapist_id.eq.${profile.therapist_id}`
		)
		.order("request_date", { ascending: true });

	// Respect a request's optional specialty filter: show it only when it has
	// no specialty, or it matches this therapist's specialty.
	if (profile.specialty_id) {
		query = query.or(
			`specialty_id.is.null,specialty_id.eq.${profile.specialty_id}`
		);
	} else {
		// Therapist has no specialty set → only see specialty-agnostic requests.
		query = query.is("specialty_id", null);
	}

	if (excludedIds.length > 0) {
		query = query.not("id", "in", `(${excludedIds.join(",")})`);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}

/**
 * Full patient card for one request (used by the request details screen).
 */
export async function getRequestDetails(supabaseId: string, requestId: number) {
	const profile = await getTherapistBySupabaseId(supabaseId);
	assertApproved(profile);

	const { data, error } = await supabaseAdmin
		.from("requests")
		.select(REQUEST_SELECT)
		.eq("id", requestId)
		.single();

	if (error) {
		if (error.code === "PGRST116") throw new RequestNotFoundError();
		throw error;
	}
	return data;
}

/**
 * Accept or decline a request.
 * Accepting creates the visit (first therapist to accept wins) and records
 * the response in therapist_notifications.
 */
export async function respondToRequest(
	supabaseId: string,
	requestId: number,
	action: "accept" | "decline"
) {
	const profile = await getTherapistBySupabaseId(supabaseId);
	assertApproved(profile);

	const { data: request, error: requestError } = await supabaseAdmin
		.from("requests")
		.select(
			"id, patient_id, request_date, time_slot, is_accepted, is_archived, preferred_therapist_id"
		)
		.eq("id", requestId)
		.single();

	if (requestError) {
		if (requestError.code === "PGRST116") throw new RequestNotFoundError();
		throw requestError;
	}
	if (!request.is_accepted || request.is_archived) {
		throw new RequestNotFoundError();
	}
	// A directed request can only be handled by the chosen therapist.
	if (
		request.preferred_therapist_id &&
		request.preferred_therapist_id !== profile.therapist_id
	) {
		throw new RequestNotFoundError();
	}

	const responseStatus = action === "accept" ? "Accepted" : "Rejected";

	const { error: notificationError } = await supabaseAdmin
		.from("therapist_notifications")
		.upsert(
			{
				request_id: requestId,
				therapist_id: profile.therapist_id,
				status: responseStatus,
				responded_at: new Date().toISOString(),
			},
			{ onConflict: "request_id,therapist_id" }
		);
	if (notificationError) throw notificationError;

	if (action === "decline") {
		return { action: "declined" as const };
	}

	// The UNIQUE constraint on visits.request_id makes this race-safe:
	// the second therapist to accept gets error 23505.
	const { data: visit, error: visitError } = await supabaseAdmin
		.from("visits")
		.insert([
			{
				request_id: requestId,
				therapist_id: profile.therapist_id,
				patient_id: request.patient_id,
				scheduled_date: request.request_date,
				time_slot: request.time_slot,
			},
		])
		.select("id, request_id, scheduled_date, time_slot, status")
		.single();

	if (visitError) {
		if (visitError.code === "23505") {
			throw new RequestNotFoundError(); // already taken by another therapist
		}
		throw visitError;
	}

	return { action: "accepted" as const, visit };
}

// ---------------------------------------------------------------------------
// Visits (accepted requests waiting to be done)
// ---------------------------------------------------------------------------

export async function listVisits(supabaseId: string, status?: string) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	let query = supabaseAdmin
		.from("visits")
		.select(
			`
			id, scheduled_date, time_slot, status, therapist_notes,
			started_at, completed_at, created_at,
			requests (
				id, complaint, pain_areas, attached_docs, notes,
				locations (id, location_name)
			),
			patients (
				id, date_of_birth, gender, blood_type,
				users (first_name, last_name, phone_number, image_url)
			)
		`
		)
		.eq("therapist_id", profile.therapist_id)
		.order("scheduled_date", { ascending: true });

	if (status) {
		query = query.eq("status", status);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data ?? [];
}

export interface UpdateVisitData {
	status?: "scheduled" | "in_progress" | "done" | "cancelled";
	therapist_notes?: string;
	cancel_reason?: string;
}

export async function updateVisit(
	supabaseId: string,
	visitId: number,
	data: UpdateVisitData
) {
	const profile = await getTherapistBySupabaseId(supabaseId);

	const updates: Record<string, unknown> = {};
	if (data.therapist_notes !== undefined)
		updates.therapist_notes = data.therapist_notes;
	if (data.status !== undefined) {
		updates.status = data.status;
		if (data.status === "in_progress") updates.started_at = new Date().toISOString();
		if (data.status === "done") updates.completed_at = new Date().toISOString();
		if (data.status === "cancelled") {
			updates.cancelled_at = new Date().toISOString();
			updates.cancel_reason = data.cancel_reason ?? null;
		}
	}

	const { data: visit, error } = await supabaseAdmin
		.from("visits")
		.update(updates)
		.eq("id", visitId)
		.eq("therapist_id", profile.therapist_id)
		.select("id, status, therapist_notes, started_at, completed_at")
		.single();

	if (error) {
		if (error.code === "PGRST116") throw new VisitNotFoundError();
		throw error;
	}
	return visit;
}

// ---------------------------------------------------------------------------
// Locations lookup (for the "areas covered" picker)
// ---------------------------------------------------------------------------

export async function listLocations() {
	const { data, error } = await supabaseAdmin
		.from("locations")
		.select("id, location_name, latitude, longitude")
		.order("location_name");

	if (error) throw error;
	return data ?? [];
}

// ---------------------------------------------------------------------------
// Specialties lookup (active list for the signup / request pickers)
// ---------------------------------------------------------------------------

export async function listActiveSpecialties() {
	const { data, error } = await supabaseAdmin
		.from("specialties")
		.select("id, name, name_ar")
		.eq("is_active", true)
		.order("name");

	if (error) throw error;
	return data ?? [];
}
