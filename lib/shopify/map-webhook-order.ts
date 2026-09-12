// lib/shopify/map-webhook-order.ts — Shopify order payload to our `orders` columns
//
// Pure: no database, no network, no environment. `scripts/check-shopify-webhook.ts`
// exercises it directly.

import { routing } from "@/i18n/routing";
import type { OrderStatus, PaymentStatus } from "@/lib/order-types";
import { PATIENT_ID_CART_ATTRIBUTE } from "./map-checkout-prefill";
import type { ShopifyWebhookOrder } from "./webhook-types";

/** Shopify sends money as strings, and omits a field entirely when it is zero. */
export function toAmount(value: string | null | undefined): number {
	const n = Number.parseFloat(value ?? "");
	return Number.isFinite(n) ? n : 0;
}

export const toOrderGid = (id: number) => `gid://shopify/Order/${id}`;
export const toVariantGid = (id: number) =>
	`gid://shopify/ProductVariant/${id}`;
export const toProductGid = (id: number) => `gid://shopify/Product/${id}`;

/**
 * `payment_status`, mapped so only labels the database enum already has are ever
 * emitted. Shopify's `partially_paid` and `authorized` mean the money is not
 * ours yet, so they read as pending rather than as a success.
 */
export function toPaymentStatus(
	financialStatus: string | null | undefined
): PaymentStatus {
	switch (financialStatus) {
		case "paid":
			return "completed";
		case "refunded":
		case "partially_refunded":
			return "refunded";
		case "voided":
			return "failed";
		default:
			// pending, authorized, partially_paid, and anything Shopify adds later.
			return "pending";
	}
}

/**
 * `order_status`, in the order the buyer experiences it. Cancellation wins over
 * everything; a delivered fulfilment beats a merely shipped one; and an order
 * that is paid but not yet shipped is "confirmed" rather than still "pending".
 */
export function toOrderStatus(payload: {
	cancelled_at?: string | null;
	fulfillment_status?: string | null;
	fulfillments?: Array<{ shipment_status: string | null }>;
	financial_status?: string | null;
}): OrderStatus {
	if (payload.cancelled_at) return "cancelled";

	const delivered = (payload.fulfillments ?? []).some(
		(f) => f.shipment_status === "delivered"
	);
	if (delivered) return "delivered";

	if (
		payload.fulfillment_status === "fulfilled" ||
		payload.fulfillment_status === "partial"
	) {
		return "shipped";
	}

	return toPaymentStatus(payload.financial_status) === "completed"
		? "confirmed"
		: "pending";
}

/**
 * The app locale the order was placed in. Shopify sends things like `ar-EG`, and
 * anything not in `routing.locales` falls back to the default rather than
 * writing a value the site cannot render.
 */
export function toOrderLocale(
	customerLocale: string | null | undefined
): string {
	const base = (customerLocale ?? "").slice(0, 2).toLowerCase();
	return (routing.locales as readonly string[]).includes(base)
		? base
		: routing.defaultLocale;
}

/**
 * The email to key the buyer on, lowercased and trimmed.
 *
 * `email` is the order's own contact email; `customer.email` covers orders where
 * a customer record exists but the order-level field is empty; `contact_email`
 * is the last resort. A phone-only checkout has none of them, and returns null.
 */
export function resolveBuyerEmail(payload: {
	email?: string | null;
	customer?: { email: string | null } | null;
	contact_email?: string | null;
}): string | null {
	const raw = payload.email ?? payload.customer?.email ?? payload.contact_email;
	const email = raw?.trim().toLowerCase();
	return email ? email : null;
}

/**
 * The patient id our own cart put on the order, if it survived.
 *
 * A hint only, never the sole basis for matching: Shopify drops cart attributes
 * on accelerated checkouts (Shop Pay, Apple Pay), so an order from a signed-in
 * buyer can arrive without one. Note the key is `name`, not `key`, in this payload.
 */
export function patientIdHint(
	noteAttributes: Array<{ name: string; value: string }> | undefined
): number | null {
	const raw = noteAttributes?.find(
		(a) => a.name === PATIENT_ID_CART_ATTRIBUTE
	)?.value;
	const id = Number.parseInt(raw ?? "", 10);
	return Number.isInteger(id) && id > 0 ? id : null;
}

/** Columns of an `orders` row that come purely from the payload. */
export type MappedOrderRow = {
	channel: "website";
	order_type: "purchase";
	payment_method: "online";
	payment_status: PaymentStatus;
	order_status: OrderStatus;
	locale: string;
	order_date: string;
	subtotal_amount: number;
	tax_amount: number;
	shipping_amount: number;
	discount_amount: number;
	total_amount: number;
	shopify_order_id: string;
	shopify_order_name: string;
	shopify_order_status_url: string | null;
	shopify_updated_at: string;
	soft_deleted: false;
	updated_at: string;
};

/**
 * Everything about the order that does not depend on who the buyer turned out
 * to be. Patient id, guest email and address ids are decided by the route.
 *
 * `order_type` is always `purchase` and `payment_method` always `online`:
 * Shopify checkout has no rentals and no cash on delivery.
 */
export function mapWebhookOrderToRow(
	payload: ShopifyWebhookOrder
): MappedOrderRow {
	return {
		channel: "website",
		order_type: "purchase",
		payment_method: "online",
		payment_status: toPaymentStatus(payload.financial_status),
		order_status: toOrderStatus(payload),
		locale: toOrderLocale(payload.customer_locale),
		order_date: payload.created_at,
		// Shopify's `subtotal_price` is already net of discounts, so the discount is
		// recorded for display rather than subtracted again anywhere.
		subtotal_amount: toAmount(payload.subtotal_price),
		tax_amount: toAmount(payload.total_tax),
		shipping_amount: toAmount(
			payload.total_shipping_price_set?.shop_money?.amount
		),
		discount_amount: toAmount(payload.total_discounts),
		total_amount: toAmount(payload.total_price),
		shopify_order_id: toOrderGid(payload.id),
		shopify_order_name: payload.name,
		shopify_order_status_url: payload.order_status_url,
		shopify_updated_at: payload.updated_at,
		// Both are set by hand everywhere else in this repo; there is no trigger.
		soft_deleted: false,
		updated_at: new Date().toISOString(),
	};
}

/** Columns of an `order_items` row, minus `order_id`. */
export type MappedOrderItemRow = {
	product_id: null;
	shopify_variant_id: string | null;
	shopify_product_id: string | null;
	shopify_handle: string | null;
	title_snapshot: string;
	variant_title_snapshot: string | null;
	image_url_snapshot: string | null;
	quantity: number;
	price_at_purchase: number;
	rental_start_date: null;
	rental_end_date: null;
};

/**
 * Line items, carrying a snapshot of what was sold at what price.
 *
 * The snapshot is not denormalisation for its own sake: Shopify may rename,
 * re-price or delete the product tomorrow, and an order has to keep saying what
 * the buyer actually bought. `handle` and `image` are not in the payload, so
 * they are looked up separately and passed in here.
 */
export function mapWebhookLineItems(
	payload: ShopifyWebhookOrder,
	snapshots: Map<string, { handle: string | null; imageUrl: string | null }>
): MappedOrderItemRow[] {
	return (payload.line_items ?? []).map((item) => {
		const variantGid =
			item.variant_id != null ? toVariantGid(item.variant_id) : null;
		const snapshot = variantGid ? snapshots.get(variantGid) : undefined;

		return {
			// Never a Supabase catalog product: this order came from Shopify.
			product_id: null,
			shopify_variant_id: variantGid,
			shopify_product_id:
				item.product_id != null ? toProductGid(item.product_id) : null,
			shopify_handle: snapshot?.handle ?? null,
			title_snapshot: item.title,
			variant_title_snapshot: item.variant_title,
			image_url_snapshot: snapshot?.imageUrl ?? null,
			quantity: item.quantity,
			price_at_purchase: toAmount(item.price),
			rental_start_date: null,
			rental_end_date: null,
		};
	});
}
