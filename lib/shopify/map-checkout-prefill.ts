// lib/shopify/map-checkout-prefill.ts — Doctoory account data → Shopify `CartInput`
//
// Pure functions only: no network, no database. `checkout-prefill.ts` gathers
// the data, this file shapes it. Keeping the mapping pure is what lets
// `scripts/check-shopify-checkout.ts` exercise it without a store or a DB.

import type { PatientAddress } from "@/lib/order-types";
import { SHOPIFY_STORE_COUNTRY_CODE } from "./locale";
import type {
	StorefrontCartBuyerIdentityInput,
	StorefrontCartDeliveryAddressInput,
	StorefrontCartPrefillInput,
} from "./types";

/**
 * What we know about a signed-in buyer before they reach checkout. Everything
 * is optional: a buyer with no profile row, no patient record or no saved
 * address still gets whatever can be pre-filled.
 */
export type CheckoutPrefill = {
	/** `patients.id`, stamped on the cart so the order can be matched back to the account. */
	patientId: number | null;
	email: string | null;
	phone: string | null;
	firstName: string | null;
	lastName: string | null;
	/** The buyer's primary saved address, else the most recent one. */
	address: PatientAddress | null;
};

/**
 * Cart attribute carrying the buyer's `patients.id`. The `__` prefix hides it
 * on the checkout page while keeping it on the order as a `note_attribute`.
 * Treat it as a hint when matching orders back, not as the key: Shopify is
 * known to drop cart attributes on accelerated checkouts, so the buyer's email
 * is what an order is matched on.
 */
export const PATIENT_ID_CART_ATTRIBUTE = "__doctoory_patient_id";

/**
 * Builds the buyer, delivery and attribute parts of a `CartInput`.
 *
 * Always returns a `buyerIdentity` with the store country, even for guests
 * (`prefill` null), so checkout prices in EGP. Everything else is added only
 * when we actually have it. Blank strings are dropped rather than sent,
 * because Shopify treats `""` as a value.
 */
export function buildPrefilledCartInput(
	prefill: CheckoutPrefill | null
): StorefrontCartPrefillInput {
	const buyerIdentity: StorefrontCartBuyerIdentityInput = {
		countryCode: SHOPIFY_STORE_COUNTRY_CODE,
	};
	if (!prefill) return { buyerIdentity };

	const email = nonEmpty(prefill.email);
	// The address phone is the number the courier will call, so it wins.
	const phone = toE164EgyptPhone(prefill.address?.phone ?? prefill.phone);
	if (email) buyerIdentity.email = email;
	if (phone) buyerIdentity.phone = phone;

	const input: StorefrontCartPrefillInput = { buyerIdentity };

	if (prefill.address) {
		input.delivery = {
			addresses: [
				{
					selected: true,
					validationStrategy: "COUNTRY_CODE_ONLY",
					address: {
						deliveryAddress: toDeliveryAddress(prefill.address, prefill, phone),
					},
				},
			],
		};
	}

	if (prefill.patientId !== null) {
		input.attributes = [
			{ key: PATIENT_ID_CART_ATTRIBUTE, value: String(prefill.patientId) },
		];
	}

	return input;
}

/**
 * Maps a saved `patient_addresses` row onto Shopify's two-line address format.
 *
 * Egyptian addresses carry building, floor and apartment, which Shopify has no
 * fields for, so they are composed into `address2`. That is lossy on the way
 * back (a buyer who edits the line at checkout returns one free-text string),
 * and that is accepted: parsing it back is not worth owning.
 *
 * `provinceCode` is deliberately left out. `governorate` is free text here and
 * Shopify wants an ISO 3166-2 code, so the buyer picks their governorate from
 * Shopify's dropdown: one field. ponytail: add a name-to-code table once the
 * order webhook shows which `province_code` values Shopify actually sends.
 */
function toDeliveryAddress(
	address: PatientAddress,
	buyer: Pick<CheckoutPrefill, "firstName" | "lastName">,
	phone: string | undefined
): StorefrontCartDeliveryAddressInput {
	return compact({
		countryCode: SHOPIFY_STORE_COUNTRY_CODE,
		firstName: nonEmpty(buyer.firstName),
		lastName: nonEmpty(buyer.lastName),
		address1: nonEmpty(address.street),
		address2: composeAddress2(address),
		city: nonEmpty(address.city),
		phone,
	});
}

/** `"Bldg 12, Floor 3, Apt 5"`, or undefined when none of the three is set. */
export function composeAddress2(address: {
	building_name: string | null;
	floor: string | null;
	apartment: string | null;
}): string | undefined {
	const parts = [
		labelled("Bldg", address.building_name),
		labelled("Floor", address.floor),
		labelled("Apt", address.apartment),
	].filter((part): part is string => part !== undefined);
	return parts.length > 0 ? parts.join(", ") : undefined;
}

function labelled(label: string, value: string | null): string | undefined {
	const trimmed = nonEmpty(value);
	return trimmed ? `${label} ${trimmed}` : undefined;
}

/**
 * Normalises an Egyptian phone number to E.164 (`+20…`), the only format
 * Shopify accepts. Returns undefined when the input cannot be normalised with
 * confidence: a missing phone at checkout is one extra field for the buyer, a
 * rejected one would fail the whole cart.
 *
 * Accepted shapes (spaces, dashes and brackets are ignored):
 *   01001234567       → +201001234567   national format, leading 0
 *   0223456789        → +20223456789    landline, same rule
 *   201001234567      → +201001234567   country code without +
 *   +20 100 123 4567  → +201001234567
 *   +20 0100 123 4567 → +201001234567   stray national 0 after the country code
 *   00201001234567    → +201001234567   international dialling prefix
 *   +1 613 555 1111   → +16135551111    other countries pass through as given
 *
 * ponytail: Egypt-only heuristic. Reach for libphonenumber if buyers with
 * numbers outside these shapes start appearing.
 */
export function toE164EgyptPhone(
	raw: string | null | undefined
): string | undefined {
	if (!raw) return undefined;
	const trimmed = raw.trim();
	const hasPlus = trimmed.startsWith("+");
	let digits = trimmed.replace(/\D/g, "");
	if (!digits) return undefined;

	// "0020…" → "20…"
	if (!hasPlus && digits.startsWith("00")) digits = digits.slice(2);
	// "+20 0100…" → "20100…": no Egyptian subscriber number starts with 0
	// after the country code, so the 0 is always a stray national prefix.
	if (digits.startsWith("200")) digits = `20${digits.slice(3)}`;

	// National format: "0" + 9 or 10 digits
	if (
		!hasPlus &&
		digits.startsWith("0") &&
		digits.length >= 10 &&
		digits.length <= 11
	) {
		return `+20${digits.slice(1)}`;
	}

	// Country code with or without "+": "20" + 9 or 10 digits
	if (digits.startsWith("20") && digits.length >= 11 && digits.length <= 12) {
		return `+${digits}`;
	}

	// Explicitly international, within E.164's 15-digit limit. E.164 numbers
	// never start with 0.
	if (
		hasPlus &&
		!digits.startsWith("0") &&
		digits.length >= 8 &&
		digits.length <= 15
	) {
		return `+${digits}`;
	}

	return undefined;
}

function nonEmpty(value: string | null | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

/** Drops undefined values so Shopify never receives an explicit null or blank. */
function compact<T extends object>(obj: T): T {
	return Object.fromEntries(
		Object.entries(obj).filter(([, value]) => value !== undefined)
	) as T;
}
