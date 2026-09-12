// lib/shopify/map-order-address.ts — Shopify checkout address to `patient_addresses`
//
// Pure: no database, no network. `scripts/check-shopify-webhook.ts` exercises it.

import type { PatientAddress } from "@/lib/order-types";
import { normalizeSearchText } from "./filter-products-locally";
import type { ShopifyWebhookAddress } from "./webhook-types";

/**
 * Column widths in `patient_addresses`, mirrored here so one over-long value
 * from Shopify cannot fail the whole insert and lose the address.
 *
 * These are checked by the verification block in migration
 * `011_shopify_orders.sql`. If a column is widened, widen it here too; the
 * cost of being conservative is a truncated address line, the cost of being
 * wrong the other way is a dropped address.
 */
export const ADDRESS_FIELD_LENGTHS = {
	address_label: 100,
	governorate: 100,
	city: 100,
	street: 255,
	additional_directions: 500,
	phone: 20,
} as const;

/** Trim, collapse whitespace, and return null for anything empty. */
function clean(value: string | null | undefined): string | null {
	const trimmed = value?.trim().replace(/\s+/g, " ");
	return trimmed ? trimmed : null;
}

function truncate(value: string | null, max: number): string | null {
	if (value === null) return null;
	return value.length > max ? value.slice(0, max) : value;
}

/** The label a store order's address carries in the buyer's address book. */
export const STORE_ADDRESS_LABEL = "Store delivery";

/** The columns of a `patient_addresses` row, as far as a Shopify address can fill them. */
export type MappedPatientAddress = {
	patient_id: number;
	address_type: "House";
	address_label: string;
	governorate: string;
	city: string;
	street: string;
	building_name: null;
	floor: null;
	apartment: null;
	additional_directions: string | null;
	phone: string | null;
	latitude: number | null;
	longitude: number | null;
	is_primary: boolean;
	is_deleted: false;
};

/**
 * Map what the buyer typed at Shopify's checkout onto our address columns.
 *
 * The mapping is lossy and that is accepted. Shopify has no building, floor or
 * apartment fields, so those stay null even when the buyer's saved address
 * originally had them and pre-fill composed them into `address2`. Parsing
 * `"Bldg 5, Floor 3, Apt 12"` back apart would be guesswork on free text the
 * buyer is free to have rewritten.
 *
 * `governorate` and `city` are NOT NULL in the table, so each falls back rather
 * than producing a row Postgres will reject. `address_type` is NOT NULL with no
 * Shopify equivalent, so every store address is recorded as `House`.
 */
export function shopifyAddressToPatientAddress(
	address: ShopifyWebhookAddress,
	patientId: number,
	isPrimary: boolean
): MappedPatientAddress {
	const city = clean(address.city);
	// Shopify's `province` is free text like ours; `province_code` is the ISO
	// code, and the city stands in when the buyer's country has no regions.
	const governorate =
		clean(address.province) ?? clean(address.province_code) ?? city;

	return {
		patient_id: patientId,
		address_type: "House",
		address_label: STORE_ADDRESS_LABEL,
		governorate: truncate(governorate, ADDRESS_FIELD_LENGTHS.governorate) ?? "",
		city: truncate(city, ADDRESS_FIELD_LENGTHS.city) ?? "",
		street:
			truncate(clean(address.address1), ADDRESS_FIELD_LENGTHS.street) ?? "",
		building_name: null,
		floor: null,
		apartment: null,
		additional_directions: truncate(
			clean(address.address2),
			ADDRESS_FIELD_LENGTHS.additional_directions
		),
		phone: truncate(clean(address.phone), ADDRESS_FIELD_LENGTHS.phone),
		latitude: address.latitude ?? null,
		longitude: address.longitude ?? null,
		is_primary: isPrimary,
		is_deleted: false,
	};
}

/**
 * A comparable form of an address, so the same delivery address arriving on a
 * second order does not become a second row in the buyer's address book.
 *
 * Governorate is deliberately excluded: our field is free text a buyer typed,
 * Shopify's `province` is its own spelling of the region, and the two disagree
 * often enough that including it would defeat the dedupe. City plus street plus
 * the second line is specific enough in practice.
 *
 * Normalisation is the same Arabic-aware pass used for product search, so
 * "شارع الملك" and "شارع الملك" with different alef forms collapse together.
 */
export function addressFingerprint(address: {
	city?: string | null;
	street?: string | null;
	additional_directions?: string | null;
}): string {
	return [address.city, address.street, address.additional_directions]
		.map((part) => normalizeSearchText(clean(part) ?? ""))
		.join("|");
}

/** Whether the patient already has this address saved. */
export function findMatchingAddress(
	candidate: {
		city?: string | null;
		street?: string | null;
		additional_directions?: string | null;
	},
	existing: PatientAddress[]
): PatientAddress | null {
	const target = addressFingerprint(candidate);
	return existing.find((a) => addressFingerprint(a) === target) ?? null;
}
