// lib/shopify/webhook-types.ts — the shape Shopify's order webhooks deliver
//
// Admin webhooks post the REST Admin API's Order JSON, which is a different
// shape from everything else in this folder (that is Storefront GraphQL). Only
// the fields actually read are declared; Shopify sends far more.
//
// Reference: https://shopify.dev/docs/api/admin-rest/latest/resources/order

/** Shopify's shipping/billing address block. Absent on pickup and digital orders. */
export type ShopifyWebhookAddress = {
	first_name: string | null;
	last_name: string | null;
	name: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	/** Free-text region name, e.g. "Cairo". */
	province: string | null;
	/** ISO 3166-2 subdivision code when Shopify recognises the region. */
	province_code: string | null;
	country: string | null;
	country_code: string | null;
	zip: string | null;
	phone: string | null;
	company: string | null;
	latitude: number | null;
	longitude: number | null;
};

/**
 * One purchased line. Note what is missing: no product handle and no image, so
 * anything the order page wants to show has to be fetched separately.
 *
 * `variant_id` and `product_id` are null for deleted variants and for custom
 * line items a merchant typed by hand. Those orders still have to land.
 */
export type ShopifyWebhookLineItem = {
	id: number;
	variant_id: number | null;
	product_id: number | null;
	title: string;
	variant_title: string | null;
	quantity: number;
	price: string;
	sku: string | null;
};

/** `financial_status` values Shopify documents. */
export type ShopifyFinancialStatus =
	| "pending"
	| "authorized"
	| "partially_paid"
	| "paid"
	| "partially_refunded"
	| "refunded"
	| "voided";

/** `fulfillment_status` is null until something ships. */
export type ShopifyFulfillmentStatus = "fulfilled" | "partial" | "restocked";

export type ShopifyWebhookOrder = {
	id: number;
	/** The buyer-facing order number, e.g. `#1001`. */
	name: string;
	email: string | null;
	contact_email: string | null;
	customer: { id: number; email: string | null } | null;
	created_at: string;
	updated_at: string;
	cancelled_at: string | null;
	financial_status: ShopifyFinancialStatus | string | null;
	fulfillment_status: ShopifyFulfillmentStatus | string | null;
	fulfillments?: Array<{ shipment_status: string | null }>;
	/** e.g. `"ar"` or `"ar-EG"`, from `@inContext(language:)` on the cart. */
	customer_locale: string | null;
	currency: string | null;
	/** Already net of discounts in Shopify's payload. */
	subtotal_price: string | null;
	total_tax: string | null;
	total_discounts: string | null;
	total_price: string | null;
	total_shipping_price_set?: {
		shop_money?: { amount: string | null } | null;
	} | null;
	/** The buyer's own Shopify tracking page. Shown as "Track order". */
	order_status_url: string | null;
	shipping_address: ShopifyWebhookAddress | null;
	billing_address: ShopifyWebhookAddress | null;
	line_items: ShopifyWebhookLineItem[];
	/** Cart attributes arrive here, and as `{ name, value }`, not `{ key, value }`. */
	note_attributes?: Array<{ name: string; value: string }>;
	/** `web`, `pos`, `shopify_draft_order`, … Useful in logs. */
	source_name: string | null;
};
