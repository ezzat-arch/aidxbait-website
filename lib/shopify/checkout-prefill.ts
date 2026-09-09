// lib/shopify/checkout-prefill.ts — what a signed-in buyer's checkout can be pre-filled with
//
// SERVER ONLY. Reads with the service-role Supabase client, so this module must
// never reach client code. It is deliberately not re-exported from
// `lib/shopify/index.ts`, which client components import; import it directly
// from server code (`@/lib/shopify/checkout-prefill`).

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PatientAddress } from "@/lib/order-types";
import { claimGuestOrders } from "@/lib/orders/claim-guest-orders";
import type { CheckoutPrefill } from "./map-checkout-prefill";

const LOG = "[Checkout]";

/**
 * Resolves the buyer's profile, patient record and best saved address:
 * `users` (by `supabase_id`) → `patients` (by `user_id`) → `patient_addresses`
 * (primary first, else most recent).
 *
 * Degrades instead of failing. Each step that is missing or errors leaves its
 * fields null, and a buyer with no `users` row still gets their auth email.
 * Never throws: pre-fill is a convenience and must never block a purchase.
 *
 * This is not `getUserBySupabaseId` from the app services on purpose. That
 * helper throws for anyone whose `user_type` is not exactly `"patient"`, and
 * website sign-up stores `"Patient"`, so it would reject every web buyer. It
 * also has no reason to stop a therapist or admin from buying.
 */
export async function getCheckoutPrefill(authUser: {
	id: string;
	email: string | null;
}): Promise<CheckoutPrefill | null> {
	const prefill: CheckoutPrefill = {
		patientId: null,
		email: authUser.email,
		phone: null,
		firstName: null,
		lastName: null,
		address: null,
	};
	const authOnly = () => (prefill.email ? prefill : null);

	try {
		const { data: user, error: userError } = await supabaseAdmin
			.from("users")
			.select("id, first_name, last_name, email, phone_number")
			.eq("supabase_id", authUser.id)
			.maybeSingle();

		if (userError) {
			console.error(
				`${LOG} users lookup failed, pre-filling from auth only:`,
				userError.message
			);
			return authOnly();
		}
		if (!user) return authOnly();

		prefill.email = user.email ?? prefill.email;
		prefill.phone = user.phone_number ?? null;
		prefill.firstName = user.first_name ?? null;
		prefill.lastName = user.last_name ?? null;

		const { data: patient, error: patientError } = await supabaseAdmin
			.from("patients")
			.select("id")
			.eq("user_id", user.id)
			.maybeSingle();

		if (patientError) {
			console.error(
				`${LOG} patients lookup failed, skipping saved address:`,
				patientError.message
			);
			return prefill;
		}
		if (!patient) return prefill;

		prefill.patientId = patient.id;

		// Claim any order this person placed as a guest with this email, *before*
		// the address lookup below: an address that arrives with a claimed order
		// then pre-fills on this very click rather than on the next one. Wrapped in
		// its own try/catch because a claim failure must never cost the buyer their
		// pre-fill, let alone their checkout.
		try {
			await claimGuestOrders(prefill.email, patient.id);
		} catch (claimError) {
			console.error(`${LOG} guest-order claim failed, continuing:`, claimError);
		}

		const { data: address, error: addressError } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("patient_id", patient.id)
			.eq("is_deleted", false)
			.order("is_primary", { ascending: false })
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		if (addressError) {
			console.error(
				`${LOG} address lookup failed, skipping saved address:`,
				addressError.message
			);
			return prefill;
		}

		prefill.address = (address as PatientAddress | null) ?? null;
		return prefill;
	} catch (error) {
		console.error(`${LOG} pre-fill lookup threw, continuing as guest:`, error);
		return authOnly();
	}
}
