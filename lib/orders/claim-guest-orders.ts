// lib/orders/claim-guest-orders.ts — attaching guest orders to an account
//
// SERVER ONLY (service-role client).

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ShopifyWebhookAddress } from "@/lib/shopify/webhook-types";
import { saveShopifyAddress } from "./save-shopify-address";

const LOG = "[Claim]";

/**
 * Attach every order placed as a guest with this email to the patient, importing
 * the delivery address through the same mapper and dedupe the webhook uses.
 * Returns how many orders were claimed.
 *
 * Idempotent: claimed rows have `patient_id` set and `guest_email` cleared, so a
 * second run finds nothing. The common case is one indexed query returning zero
 * rows.
 *
 * Claim on read rather than on sign-up, deliberately. Sessions begin in four
 * places (the server action, the REST signup route, the mobile RPC, and plain
 * sign-in), and hooking each one leaves the next one broken the first time
 * somebody adds a fifth. The two callers here, `GET /api/orders` and
 * `getCheckoutPrefill`, are funnels every one of those paths runs through, and
 * this also covers the buyer who already had an account, checked out as a guest
 * anyway, and signed in later.
 *
 * ponytail: claim-on-read; move to a sign-up hook if it ever shows in latency.
 */
export async function claimGuestOrders(
	email: string | null,
	patientId: number | null
): Promise<number> {
	// An account with no patient record (therapist, admin) has nothing to claim
	// into: orders hang off `patients`, not `users`.
	if (!email || !patientId) return 0;

	const normalised = email.trim().toLowerCase();
	if (!normalised) return 0;

	try {
		// `guest_email` is stored already lowercased and trimmed, so this is a plain
		// equality match on an indexed column: supabase-js cannot use a `lower()`
		// expression index, which is why the normalisation happens on write.
		const { data: orders, error } = await supabaseAdmin
			.from("orders")
			.select("id, guest_shipping_address")
			.is("patient_id", null)
			.eq("guest_email", normalised);

		if (error) {
			console.error(`${LOG} lookup failed:`, error.message);
			return 0;
		}
		if (!orders?.length) return 0;

		let claimed = 0;
		for (const order of orders) {
			const address =
				order.guest_shipping_address as ShopifyWebhookAddress | null;
			// A pickup or digital order has no address; it is still claimed.
			const addressId = address
				? await saveShopifyAddress(patientId, address)
				: null;

			const { error: updateError } = await supabaseAdmin
				.from("orders")
				.update({
					patient_id: patientId,
					shipping_address_id: addressId,
					billing_address_id: addressId,
					guest_email: null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", order.id)
				// Re-assert the guard so two concurrent claims cannot both win.
				.is("patient_id", null);

			if (updateError) {
				console.error(
					`${LOG} could not claim order ${order.id}:`,
					updateError.message
				);
				continue;
			}
			claimed += 1;
		}

		if (claimed > 0) {
			console.log(
				`${LOG} claimed ${claimed} guest order(s) for patient`,
				patientId
			);
		}
		return claimed;
	} catch (error) {
		console.error(`${LOG} claim threw:`, error);
		return 0;
	}
}
