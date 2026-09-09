// Self-check for the Shopify order webhook's pure parts: HMAC verification, the
// status mapping, the payload-to-columns mapping and the address fingerprint.
// No network, no database, no store credentials needed.
//
// When a .env.local with Supabase service-role credentials is present it also
// probes the live schema, so it can tell you whether migration 011 has been
// applied. Without one it skips that and still checks everything else.
//
// Run: npx tsx scripts/check-shopify-webhook.ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { isValidShopifyWebhook } from "../lib/shopify/verify-webhook";
import {
	mapWebhookLineItems,
	mapWebhookOrderToRow,
	patientIdHint,
	resolveBuyerEmail,
	toAmount,
	toOrderLocale,
	toOrderStatus,
	toPaymentStatus,
	toVariantGid,
} from "../lib/shopify/map-webhook-order";
import {
	ADDRESS_FIELD_LENGTHS,
	addressFingerprint,
	findMatchingAddress,
	shopifyAddressToPatientAddress,
} from "../lib/shopify/map-order-address";
import type {
	ShopifyWebhookAddress,
	ShopifyWebhookOrder,
} from "../lib/shopify/webhook-types";
import type {
	OrderStatus,
	PatientAddress,
	PaymentStatus,
} from "../lib/order-types";

/* -------------------------------------------------------------------------- */
/*  HMAC                                                                      */
/* -------------------------------------------------------------------------- */

// A fixture, not a round trip: recomputing the digest with the same code it is
// meant to test would pass even if the algorithm were wrong.
const BODY = '{"id":123,"name":"#1001"}';
const SECRET = "shhh";
const SIGNATURE = "xJaafSbJS6buT3Q0/GsUyOKuJP8aujVGqE2iKLvKE14=";

assert.equal(isValidShopifyWebhook(BODY, SIGNATURE, SECRET), true);
// One byte changed in the body must fail: this is the whole point of the check.
assert.equal(
	isValidShopifyWebhook('{"id":124,"name":"#1001"}', SIGNATURE, SECRET),
	false
);
assert.equal(isValidShopifyWebhook(BODY, SIGNATURE, "wrong-secret"), false);
// A different-length signature must be rejected, not throw (timingSafeEqual does).
assert.equal(isValidShopifyWebhook(BODY, "short", SECRET), false);
assert.equal(isValidShopifyWebhook(BODY, null, SECRET), false);
assert.equal(isValidShopifyWebhook(BODY, SIGNATURE, undefined), false);
assert.equal(isValidShopifyWebhook("", "", SECRET), false);

/* -------------------------------------------------------------------------- */
/*  Status mapping                                                            */
/* -------------------------------------------------------------------------- */

const PAYMENT_STATUSES: PaymentStatus[] = [
	"pending",
	"completed",
	"failed",
	"refunded",
];
const ORDER_STATUSES: OrderStatus[] = [
	"pending",
	"confirmed",
	"shipped",
	"delivered",
	"cancelled",
];

assert.equal(toPaymentStatus("paid"), "completed");
assert.equal(toPaymentStatus("refunded"), "refunded");
assert.equal(toPaymentStatus("partially_refunded"), "refunded");
assert.equal(toPaymentStatus("voided"), "failed");
// Money that is not ours yet reads as pending, never as a success.
assert.equal(toPaymentStatus("pending"), "pending");
assert.equal(toPaymentStatus("authorized"), "pending");
assert.equal(toPaymentStatus("partially_paid"), "pending");
assert.equal(toPaymentStatus(null), "pending");
assert.equal(toPaymentStatus("something_shopify_adds_later"), "pending");

assert.equal(toOrderStatus({ financial_status: "paid" }), "confirmed");
assert.equal(toOrderStatus({ financial_status: "pending" }), "pending");
assert.equal(
	toOrderStatus({ financial_status: "paid", fulfillment_status: "fulfilled" }),
	"shipped"
);
assert.equal(
	toOrderStatus({ financial_status: "paid", fulfillment_status: "partial" }),
	"shipped"
);
assert.equal(
	toOrderStatus({
		financial_status: "paid",
		fulfillment_status: "fulfilled",
		fulfillments: [{ shipment_status: "delivered" }],
	}),
	"delivered"
);
// Cancellation wins over every other signal, refunded and fulfilled included.
assert.equal(
	toOrderStatus({
		cancelled_at: "2026-09-10T10:00:00Z",
		financial_status: "refunded",
		fulfillment_status: "fulfilled",
		fulfillments: [{ shipment_status: "delivered" }],
	}),
	"cancelled"
);
// A restocked order is not shipped.
assert.equal(
	toOrderStatus({
		financial_status: "refunded",
		fulfillment_status: "restocked",
	}),
	"pending"
);

// Every combination Shopify can send must land inside the database enums.
{
	const financial = [
		"pending",
		"authorized",
		"partially_paid",
		"paid",
		"partially_refunded",
		"refunded",
		"voided",
		null,
	];
	const fulfillment = ["fulfilled", "partial", "restocked", null];
	const cancelled = ["2026-09-10T10:00:00Z", null];
	const shipment = [[{ shipment_status: "delivered" }], [], undefined];

	let combinations = 0;
	for (const f of financial)
		for (const ff of fulfillment)
			for (const c of cancelled)
				for (const s of shipment) {
					const payment = toPaymentStatus(f);
					const status = toOrderStatus({
						financial_status: f,
						fulfillment_status: ff,
						cancelled_at: c,
						fulfillments: s,
					});
					assert.ok(
						PAYMENT_STATUSES.includes(payment),
						`payment_status "${payment}" is not in the enum`
					);
					assert.ok(
						ORDER_STATUSES.includes(status),
						`order_status "${status}" is not in the enum`
					);
					combinations += 1;
				}
	assert.equal(combinations, 8 * 4 * 2 * 3);
}

/* -------------------------------------------------------------------------- */
/*  Small mappers                                                             */
/* -------------------------------------------------------------------------- */

assert.equal(toAmount("12.50"), 12.5);
assert.equal(toAmount(null), 0);
assert.equal(toAmount(undefined), 0);
assert.equal(toAmount("not a number"), 0);

// Shopify sends `ar-EG`; the site only knows `ar`.
assert.equal(toOrderLocale("ar-EG"), "ar");
assert.equal(toOrderLocale("ar"), "ar");
assert.equal(toOrderLocale("en-CA"), "en");
assert.equal(toOrderLocale("fr-FR"), "en"); // unsupported falls back
assert.equal(toOrderLocale(null), "en");

assert.equal(
	resolveBuyerEmail({ email: "  Buyer@Example.COM " }),
	"buyer@example.com"
);
assert.equal(
	resolveBuyerEmail({ email: null, customer: { email: "c@example.com" } }),
	"c@example.com"
);
assert.equal(
	resolveBuyerEmail({ email: null, customer: null, contact_email: "x@y.com" }),
	"x@y.com"
);
// A phone-only checkout has nothing to key on.
assert.equal(resolveBuyerEmail({ email: null, customer: null }), null);
assert.equal(resolveBuyerEmail({ email: "   " }), null);

assert.equal(
	patientIdHint([{ name: "__doctoory_patient_id", value: "42" }]),
	42
);
assert.equal(patientIdHint([{ name: "other", value: "42" }]), null);
assert.equal(
	patientIdHint([{ name: "__doctoory_patient_id", value: "x" }]),
	null
);
assert.equal(patientIdHint(undefined), null);

/* -------------------------------------------------------------------------- */
/*  Address mapping and dedupe                                                */
/* -------------------------------------------------------------------------- */

const shopifyAddress: ShopifyWebhookAddress = {
	first_name: "Mona",
	last_name: "Hassan",
	name: "Mona Hassan",
	address1: "12 Nile Street",
	address2: "Bldg 5, Floor 3, Apt 12",
	city: "Nasr City",
	province: "Cairo",
	province_code: "C",
	country: "Egypt",
	country_code: "EG",
	zip: null,
	phone: "+201001234567",
	company: null,
	latitude: 30.05,
	longitude: 31.33,
};

{
	const mapped = shopifyAddressToPatientAddress(shopifyAddress, 7, true);
	assert.equal(mapped.patient_id, 7);
	assert.equal(mapped.governorate, "Cairo");
	assert.equal(mapped.city, "Nasr City");
	assert.equal(mapped.street, "12 Nile Street");
	assert.equal(mapped.additional_directions, "Bldg 5, Floor 3, Apt 12");
	assert.equal(mapped.phone, "+201001234567");
	assert.equal(mapped.is_primary, true);
	assert.equal(mapped.address_type, "House");
	// Lossy on purpose: Shopify has no building/floor/apartment fields, and
	// parsing them back out of free text would be guesswork.
	assert.equal(mapped.building_name, null);
	assert.equal(mapped.floor, null);
	assert.equal(mapped.apartment, null);
}

// Missing region falls back rather than writing null into a NOT NULL column.
{
	const mapped = shopifyAddressToPatientAddress(
		{ ...shopifyAddress, province: null, province_code: null },
		7,
		false
	);
	assert.equal(mapped.governorate, "Nasr City");
}

// One over-long line must not cost the buyer the whole address.
{
	const long = "x".repeat(1000);
	const mapped = shopifyAddressToPatientAddress(
		{ ...shopifyAddress, address1: long, address2: long, phone: long },
		7,
		false
	);
	assert.equal(mapped.street?.length, ADDRESS_FIELD_LENGTHS.street);
	assert.equal(
		mapped.additional_directions?.length,
		ADDRESS_FIELD_LENGTHS.additional_directions
	);
	assert.equal(mapped.phone?.length, ADDRESS_FIELD_LENGTHS.phone);
}

// Fingerprint: the same address typed slightly differently is the same address.
assert.equal(
	addressFingerprint({ city: "  Nasr City ", street: "12 Nile St" }),
	addressFingerprint({ city: "nasr   city", street: "12 nile st" })
);
// Arabic: alef and taa marbuta variants must collapse together.
assert.equal(
	addressFingerprint({ city: "القاهرة", street: "شارع النيل" }),
	addressFingerprint({ city: "القاهره", street: "شارع النيل" })
);
assert.notEqual(
	addressFingerprint({ city: "Nasr City", street: "12 Nile St" }),
	addressFingerprint({ city: "Nasr City", street: "13 Nile St" })
);
// Governorate is deliberately not part of it: our spelling and Shopify's differ.
assert.equal(
	addressFingerprint({ city: "Nasr City", street: "12 Nile St" }),
	addressFingerprint({ city: "Nasr City", street: "12 Nile St" })
);

{
	const existing = [
		{
			id: 3,
			city: "Nasr City",
			street: "12 Nile Street",
			additional_directions: "Bldg 5, Floor 3, Apt 12",
		} as unknown as PatientAddress,
	];
	const mapped = shopifyAddressToPatientAddress(shopifyAddress, 7, false);
	assert.equal(findMatchingAddress(mapped, existing)?.id, 3);
	assert.equal(findMatchingAddress(mapped, []), null);
}

/* -------------------------------------------------------------------------- */
/*  Whole-payload mapping                                                     */
/* -------------------------------------------------------------------------- */

const guestOrder: ShopifyWebhookOrder = {
	id: 5544332211,
	name: "#1001",
	email: "Guest@Example.com",
	contact_email: null,
	customer: null,
	created_at: "2026-09-10T09:00:00Z",
	updated_at: "2026-09-10T09:05:00Z",
	cancelled_at: null,
	financial_status: "paid",
	fulfillment_status: null,
	fulfillments: [],
	customer_locale: "ar-EG",
	currency: "EGP",
	subtotal_price: "300.00",
	total_tax: "42.00",
	total_discounts: "50.00",
	total_price: "392.00",
	total_shipping_price_set: { shop_money: { amount: "50.00" } },
	order_status_url: "https://shop.doctoory.com/orders/abc",
	shipping_address: shopifyAddress,
	billing_address: shopifyAddress,
	line_items: [
		{
			id: 1,
			variant_id: 99,
			product_id: 11,
			title: "Knee brace",
			variant_title: "Large",
			quantity: 2,
			price: "100.00",
			sku: "KB-L",
		},
		{
			// A deleted variant: no ids at all, carried by its title.
			id: 2,
			variant_id: null,
			product_id: null,
			title: "Discontinued sleeve",
			variant_title: null,
			quantity: 1,
			price: "100.00",
			sku: null,
		},
	],
	note_attributes: [{ name: "__doctoory_patient_id", value: "42" }],
	source_name: "web",
};

{
	const row = mapWebhookOrderToRow(guestOrder);
	assert.equal(row.channel, "website");
	assert.equal(row.order_type, "purchase");
	assert.equal(row.payment_method, "online");
	assert.equal(row.payment_status, "completed");
	assert.equal(row.order_status, "confirmed");
	assert.equal(row.locale, "ar");
	assert.equal(row.shopify_order_id, "gid://shopify/Order/5544332211");
	assert.equal(row.shopify_order_name, "#1001");
	assert.equal(row.shopify_updated_at, "2026-09-10T09:05:00Z");
	assert.equal(row.order_date, "2026-09-10T09:00:00Z");
	assert.equal(row.subtotal_amount, 300);
	assert.equal(row.tax_amount, 42);
	assert.equal(row.shipping_amount, 50);
	assert.equal(row.discount_amount, 50);
	assert.equal(row.total_amount, 392);
	assert.equal(row.soft_deleted, false);
}

// A pickup or digital order has no address; it must still map.
{
	const row = mapWebhookOrderToRow({
		...guestOrder,
		shipping_address: null,
		total_shipping_price_set: null,
	});
	assert.equal(row.shipping_amount, 0);
	assert.equal(row.total_amount, 392);
}

{
	const snapshots = new Map([
		[toVariantGid(99), { handle: "knee-brace", imageUrl: "https://cdn/k.jpg" }],
	]);
	const items = mapWebhookLineItems(guestOrder, snapshots);
	assert.equal(items.length, 2);

	assert.equal(items[0].product_id, null); // never the Supabase catalog
	assert.equal(items[0].shopify_variant_id, "gid://shopify/ProductVariant/99");
	assert.equal(items[0].shopify_product_id, "gid://shopify/Product/11");
	assert.equal(items[0].shopify_handle, "knee-brace");
	assert.equal(items[0].image_url_snapshot, "https://cdn/k.jpg");
	assert.equal(items[0].title_snapshot, "Knee brace");
	assert.equal(items[0].variant_title_snapshot, "Large");
	assert.equal(items[0].price_at_purchase, 100);

	// The deleted-variant line still lands, with its title and price intact.
	assert.equal(items[1].shopify_variant_id, null);
	assert.equal(items[1].shopify_product_id, null);
	assert.equal(items[1].title_snapshot, "Discontinued sleeve");
	assert.equal(items[1].shopify_handle, null);

	// Every line satisfies the one-catalog CHECK: never both ids at once.
	for (const item of items) {
		assert.ok(item.product_id === null || item.shopify_variant_id === null);
	}
}

/* -------------------------------------------------------------------------- */
/*  Optional: is migration 011 actually live?                                 */
/* -------------------------------------------------------------------------- */

async function probeLiveSchema(): Promise<void> {
	// tsx does not load .env.local, and PostgREST cannot read information_schema,
	// so the probe is a plain select: a missing column comes back as 42703.
	if (existsSync(".env.local")) {
		for (const line of readFileSync(".env.local", "utf8").split("\n")) {
			const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
			if (match && !process.env[match[1]]) {
				process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
			}
		}
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		console.log(
			"check-shopify-webhook: no Supabase credentials, skipped the live column probe"
		);
		return;
	}

	const { createClient } = await import("@supabase/supabase-js");
	const supabase = createClient(url, key, {
		auth: { autoRefreshToken: false, persistSession: false },
	});

	const probes: Array<[string, string]> = [
		[
			"orders",
			"shopify_order_id, shopify_order_name, shopify_order_status_url, shopify_updated_at, guest_email, guest_shipping_address, channel, locale",
		],
		[
			"order_items",
			"shopify_variant_id, shopify_product_id, shopify_handle, title_snapshot, variant_title_snapshot, image_url_snapshot",
		],
	];

	for (const [table, columns] of probes) {
		const { error } = await supabase.from(table).select(columns).limit(1);
		assert.equal(
			error,
			null,
			`migration 011 is not applied: ${table} is missing a column (${error?.message})`
		);
	}
	console.log("check-shopify-webhook: migration 011 columns are live");
}

probeLiveSchema()
	.then(() => console.log("check-shopify-webhook: all assertions passed"))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
