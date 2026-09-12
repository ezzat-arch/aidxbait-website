// lib/orders/save-shopify-address.ts — putting a Shopify delivery address into the address book
//
// SERVER ONLY (service-role client).

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PatientAddress } from "@/lib/order-types";
import {
	findMatchingAddress,
	shopifyAddressToPatientAddress,
} from "@/lib/shopify/map-order-address";
import type { ShopifyWebhookAddress } from "@/lib/shopify/webhook-types";

const LOG = "[Shopify Webhook]";

/**
 * Save the address a buyer entered at Shopify's checkout to their Doctoory
 * address book, and return its id.
 *
 * Idempotent by fingerprint: ordering twice to the same address gives one row,
 * not two, which is the whole point of surfacing this to the buyer at all. The
 * comparison is done in app code rather than by a unique index, because the
 * fingerprint is a normalisation (Arabic-aware, whitespace-collapsing) that
 * Postgres would need a matching expression index to reproduce.
 *
 * The first address a patient ever gets becomes their primary, so the next
 * checkout pre-fills it. Returns null if the address cannot be saved; the caller
 * keeps the order either way.
 */
export async function saveShopifyAddress(
	patientId: number,
	address: ShopifyWebhookAddress
): Promise<number | null> {
	try {
		const { data: existing, error: existingError } = await supabaseAdmin
			.from("patient_addresses")
			.select("*")
			.eq("patient_id", patientId)
			.eq("is_deleted", false);

		if (existingError) {
			console.error(
				`${LOG} could not read existing addresses:`,
				existingError.message
			);
			return null;
		}

		const addresses = (existing ?? []) as PatientAddress[];
		const mapped = shopifyAddressToPatientAddress(
			address,
			patientId,
			addresses.length === 0
		);

		const match = findMatchingAddress(mapped, addresses);
		if (match) return match.id;

		const { data: inserted, error: insertError } = await supabaseAdmin
			.from("patient_addresses")
			.insert(mapped)
			.select("id")
			.single();

		if (insertError) {
			console.error(`${LOG} address insert failed:`, insertError.message);
			return null;
		}

		return inserted?.id ?? null;
	} catch (error) {
		console.error(`${LOG} address save threw:`, error);
		return null;
	}
}
