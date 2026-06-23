import { supabaseAdmin } from "@/lib/supabase/admin";
import { getUserBySupabaseId } from "@/lib/services/app/user.service";

/**
 * Visit reviews: a patient rates the therapist after a completed visit.
 * One review per visit, only for the patient's own DONE visits.
 */

export class ReviewVisitNotFoundError extends Error {
	constructor() {
		super("Visit not found.");
		this.name = "ReviewVisitNotFoundError";
	}
}

export class VisitNotCompletedError extends Error {
	constructor() {
		super("You can only review a visit after it has been completed.");
		this.name = "VisitNotCompletedError";
	}
}

export class AlreadyReviewedError extends Error {
	constructor() {
		super("You have already reviewed this visit.");
		this.name = "AlreadyReviewedError";
	}
}

export interface SubmitReviewData {
	visit_id: number;
	rating: number; // 1..5
	comment?: string;
}

/**
 * Create a review for one of the patient's completed visits.
 */
export async function submitReview(supabaseId: string, data: SubmitReviewData) {
	const user = await getUserBySupabaseId(supabaseId);

	const { data: visit, error: visitError } = await supabaseAdmin
		.from("visits")
		.select("id, patient_id, therapist_id, status")
		.eq("id", data.visit_id)
		.single();

	if (visitError) {
		if (visitError.code === "PGRST116") throw new ReviewVisitNotFoundError();
		throw visitError;
	}
	if (visit.patient_id !== user.patient_id) {
		// Don't reveal other patients' visits.
		throw new ReviewVisitNotFoundError();
	}
	if (visit.status !== "done") {
		throw new VisitNotCompletedError();
	}

	const { data: review, error } = await supabaseAdmin
		.from("visit_reviews")
		.insert([
			{
				visit_id: visit.id,
				therapist_id: visit.therapist_id,
				patient_id: visit.patient_id,
				rating: data.rating,
				comment: data.comment?.trim() || null,
			},
		])
		.select("id, rating, comment, created_at")
		.single();

	if (error) {
		if (error.code === "23505") throw new AlreadyReviewedError();
		throw error;
	}
	return review;
}

/**
 * The patient's own review for a visit (null if none yet). Used to decide
 * whether to show the "rate this visit" prompt or the submitted review.
 */
export async function getMyReviewForVisit(
	supabaseId: string,
	visitId: number
) {
	const user = await getUserBySupabaseId(supabaseId);

	const { data, error } = await supabaseAdmin
		.from("visit_reviews")
		.select("id, rating, comment, created_at")
		.eq("visit_id", visitId)
		.eq("patient_id", user.patient_id)
		.maybeSingle();

	if (error) throw error;
	return data;
}

/**
 * Public-ish list of a therapist's reviews + aggregate, for the patient app's
 * "doctor reviews" view. Reviewer names are NOT included (privacy) — only the
 * rating, comment, and date.
 */
export async function getTherapistReviews(therapistId: number, limit = 50) {
	const { data: therapist, error: therapistError } = await supabaseAdmin
		.from("therapists")
		.select("id, rating_avg, rating_count")
		.eq("id", therapistId)
		.single();

	if (therapistError) {
		if (therapistError.code === "PGRST116") {
			return { rating_avg: 0, rating_count: 0, reviews: [] };
		}
		throw therapistError;
	}

	const { data: reviews, error } = await supabaseAdmin
		.from("visit_reviews")
		.select("id, rating, comment, created_at")
		.eq("therapist_id", therapistId)
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) throw error;

	return {
		rating_avg: Number(therapist.rating_avg) || 0,
		rating_count: therapist.rating_count || 0,
		reviews: reviews ?? [],
	};
}
