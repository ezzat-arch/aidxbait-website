import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidShopifyWebhook } from "@/lib/shopify/verify-webhook";
import {
	mapWebhookLineItems,
	mapWebhookOrderToRow,
	patientIdHint,
	resolveBuyerEmail,
	toOrderGid,
	toVariantGid,
} from "@/lib/shopify/map-webhook-order";
import { getVariantSnapshots } from "@/lib/shopify/get-variant-snapshots";
import { saveShopifyAddress } from "@/lib/orders/save-shopify-address";
import type { ShopifyWebhookOrder } from "@/lib/shopify/webhook-types";

const LOG = "[Shopify Webhook]";

/** Postgres unique-violation. Two deliveries of the same order can race here. */
const UNIQUE_VIOLATION = "23505";

/**
 * POST /api/shopify/webhooks/orders/
 *
 * One route, both topics: `orders/create` and `orders/updated`. It upserts, so
 * the two need no separate handling, and `orders/updated` is what keeps a
 * fulfilled, cancelled or refunded order moving in My Orders.
 *
 * Register it in Shopify at exactly
 * `https://www.doctoory.com/api/shopify/webhooks/orders/` — canonical `www` host
 * and trailing slash. `trailingSlash: true` in `next.config.mjs` answers any
 * other spelling with a 308, and Shopify does not follow redirects: it records
 * the delivery as failed.
 *
 * Status codes carry meaning to Shopify, so they are chosen carefully:
 *   401 — signature or shop domain wrong. Nothing is written.
 *   200 — accepted, or accepted-and-ignored for a payload we cannot map. Shopify
 *         would only ever resend the identical body, so retrying is pointless.
 *   500 — our database or our bug. Shopify retries 8 times over 4 hours, which
 *         is exactly what we want; answering 200 here would lose the order.
 *
 * Shopify allows roughly five seconds, so the work is kept to a handful of
 * queries plus one Storefront call bounded by its own timeout.
 */
export async function POST(request: NextRequest) {
	// The raw text, before any parsing: the HMAC is over these exact bytes, and
	// re-serialising parsed JSON changes key order and whitespace.
	const raw = await request.text();

	const isSigned = isValidShopifyWebhook(
		raw,
		request.headers.get("x-shopify-hmac-sha256"),
		process.env.SHOPIFY_WEBHOOK_SECRET
	);
	// Shopify always sends the shop's permanent `{shop}.myshopify.com` domain
	// here, never a custom domain, however the store's primary domain is set.
	// So `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` must be the myshopify one: pointing
	// it at a custom checkout domain 401s every delivery.
	const shopDomain = request.headers.get("x-shopify-shop-domain");
	const expectedShopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
	const isOurShop = shopDomain === expectedShopDomain;

	if (!isSigned || !isOurShop) {
		// Both flags are logged separately, and the domains alongside them, so a
		// misconfigured env var is not mistaken for a signature problem. Neither
		// value is secret.
		console.error(`${LOG} rejected`, {
			signed: isSigned,
			shop: isOurShop,
			received: shopDomain,
			expected: expectedShopDomain,
		});
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 }
		);
	}

	const topic = request.headers.get("x-shopify-topic");

	let payload: ShopifyWebhookOrder;
	try {
		payload = JSON.parse(raw) as ShopifyWebhookOrder;
	} catch {
		console.error(`${LOG} body was not JSON`, { topic });
		return NextResponse.json({ success: true, data: { ignored: true } });
	}

	// No PII in logs: id, order name, topic and source only.
	console.log(`${LOG} received`, {
		topic,
		id: payload.id,
		name: payload.name,
		source: payload.source_name,
	});

	try {
		return await handleOrder(payload);
	} catch (error) {
		// A 500 asks Shopify to try again; a 200 here would discard the order.
		console.error(`${LOG} handler failed, asking Shopify to retry:`, error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 }
		);
	}
}

async function handleOrder(payload: ShopifyWebhookOrder) {
	if (!payload?.id) {
		console.error(`${LOG} payload has no order id, ignoring`);
		return NextResponse.json({ success: true, data: { ignored: true } });
	}

	const shopifyOrderId = toOrderGid(payload.id);
	const row = mapWebhookOrderToRow(payload);

	const { data: existing, error: existingError } = await supabaseAdmin
		.from("orders")
		.select("id, shopify_updated_at")
		.eq("shopify_order_id", shopifyOrderId)
		.maybeSingle();

	if (existingError) throw existingError;

	if (existing) {
		return updateExistingOrder(payload, row, existing);
	}

	return createOrder(payload, row, shopifyOrderId);
}

/* -------------------------------------------------------------------------- */
/*  Update path                                                               */
/* -------------------------------------------------------------------------- */

/**
 * An order we already have. Only statuses, money and Shopify's own fields are
 * touched: matching and address handling are deliberately not repeated, which is
 * what stops a fulfilment update from creating a duplicate address.
 */
async function updateExistingOrder(
	payload: ShopifyWebhookOrder,
	row: ReturnType<typeof mapWebhookOrderToRow>,
	existing: { id: number; shopify_updated_at: string | null }
) {
	// Retries can deliver an older `orders/updated` after a newer one, which would
	// walk a shipped order back to pending. Refuse anything not newer.
	const stored = existing.shopify_updated_at
		? Date.parse(existing.shopify_updated_at)
		: 0;
	const incoming = Date.parse(payload.updated_at ?? "");

	if (Number.isFinite(incoming) && incoming < stored) {
		console.log(`${LOG} ignoring a stale delivery`, { orderId: existing.id });
		return NextResponse.json({ success: true, data: { stale: true } });
	}

	const { error } = await supabaseAdmin
		.from("orders")
		.update({
			payment_status: row.payment_status,
			order_status: row.order_status,
			subtotal_amount: row.subtotal_amount,
			tax_amount: row.tax_amount,
			shipping_amount: row.shipping_amount,
			discount_amount: row.discount_amount,
			total_amount: row.total_amount,
			shopify_order_name: row.shopify_order_name,
			shopify_order_status_url: row.shopify_order_status_url,
			shopify_updated_at: row.shopify_updated_at,
			updated_at: row.updated_at,
		})
		.eq("id", existing.id);

	if (error) throw error;

	// Repair an order whose items never landed: the previous delivery inserted the
	// order, failed on the items, answered 500, and this is Shopify's retry.
	await ensureOrderItems(payload, existing.id);

	console.log(`${LOG} order updated`, {
		orderId: existing.id,
		payment: row.payment_status,
		status: row.order_status,
	});
	return NextResponse.json({ success: true, data: { orderId: existing.id } });
}

/* -------------------------------------------------------------------------- */
/*  Create path                                                               */
/* -------------------------------------------------------------------------- */

async function createOrder(
	payload: ShopifyWebhookOrder,
	row: ReturnType<typeof mapWebhookOrderToRow>,
	shopifyOrderId: string
) {
	const email = resolveBuyerEmail(payload);

	// A phone-only checkout gives us nothing to key the buyer on, now or later.
	// Nothing to store that anyone could ever find again, so let it go.
	if (!email) {
		console.warn(`${LOG} order has no email, not storing`, { id: payload.id });
		return NextResponse.json({ success: true, data: { ignored: true } });
	}

	const patientId = await findPatientByEmail(email, payload);

	// A guest keeps their order, keyed by email, with the raw Shopify address kept
	// as-is so `claimGuestOrders` can materialise it when they sign up.
	let shippingAddressId: number | null = null;
	if (patientId && payload.shipping_address) {
		shippingAddressId = await saveShopifyAddress(
			patientId,
			payload.shipping_address
		);
	}

	const { data: inserted, error: insertError } = await supabaseAdmin
		.from("orders")
		.insert({
			...row,
			shopify_order_id: shopifyOrderId,
			patient_id: patientId,
			guest_email: patientId ? null : email,
			// Pickup and digital orders have no address at all; that is not an error.
			guest_shipping_address: patientId ? null : payload.shipping_address,
			shipping_address_id: shippingAddressId,
			billing_address_id: shippingAddressId,
		})
		.select("id")
		.single();

	if (insertError) {
		// Two deliveries of the same order raced. The partial unique index on
		// `shopify_order_id` decided the winner; treat this as an update.
		if (insertError.code === UNIQUE_VIOLATION) {
			console.log(`${LOG} lost an insert race, updating instead`, {
				id: payload.id,
			});
			const { data: winner, error: reselectError } = await supabaseAdmin
				.from("orders")
				.select("id, shopify_updated_at")
				.eq("shopify_order_id", shopifyOrderId)
				.maybeSingle();
			if (reselectError) throw reselectError;
			if (winner) return updateExistingOrder(payload, row, winner);
		}
		throw insertError;
	}

	await insertOrderItems(payload, inserted.id);

	console.log(`${LOG} order stored`, {
		orderId: inserted.id,
		guest: patientId === null,
		payment: row.payment_status,
		status: row.order_status,
	});
	return NextResponse.json({ success: true, data: { orderId: inserted.id } });
}

/* -------------------------------------------------------------------------- */
/*  Buyer matching and line items                                             */
/* -------------------------------------------------------------------------- */

/**
 * The patient this order belongs to, or null for a guest.
 *
 * Email is the only identifier a guest checkout gives us. `_` and `%` are LIKE
 * wildcards and `_` is common in email addresses, so the `ilike` result is
 * filtered down to an exact lowercase match before it is trusted.
 */
async function findPatientByEmail(
	email: string,
	payload: ShopifyWebhookOrder
): Promise<number | null> {
	const { data: users, error } = await supabaseAdmin
		.from("users")
		.select("id, email")
		.ilike("email", email);

	if (error) throw error;

	const userIds = (users ?? [])
		.filter((u) => u.email?.trim().toLowerCase() === email)
		.map((u) => u.id);

	if (userIds.length === 0) return null;

	const { data: patients, error: patientsError } = await supabaseAdmin
		.from("patients")
		.select("id, user_id")
		.in("user_id", userIds);

	if (patientsError) throw patientsError;
	if (!patients?.length) return null;

	// Our own cart puts the patient id on the order as a note attribute. It is a
	// tie-break only: Shopify drops cart attributes on accelerated checkouts, so
	// its absence means nothing, but its presence settles a shared inbox.
	const hint = patientIdHint(payload.note_attributes);
	if (hint && patients.some((p) => p.id === hint)) return hint;

	return patients[0].id;
}

/** Line items with their handle and image looked up in one Storefront call. */
async function buildOrderItems(payload: ShopifyWebhookOrder, orderId: number) {
	const variantGids = (payload.line_items ?? [])
		.filter((item) => item.variant_id != null)
		.map((item) => toVariantGid(item.variant_id as number));

	const snapshots = await getVariantSnapshots(variantGids);

	return mapWebhookLineItems(payload, snapshots).map((item) => ({
		...item,
		order_id: orderId,
	}));
}

async function insertOrderItems(payload: ShopifyWebhookOrder, orderId: number) {
	const items = await buildOrderItems(payload, orderId);
	if (items.length === 0) return;

	const { error } = await supabaseAdmin.from("order_items").insert(items);
	// Throwing here means a 500 and a Shopify retry, which the zero-items repair
	// on the update path then completes. The order row is never left orphaned.
	if (error) throw error;
}

/** Insert the line items only if the order has none. */
async function ensureOrderItems(payload: ShopifyWebhookOrder, orderId: number) {
	const { data, error } = await supabaseAdmin
		.from("order_items")
		.select("id")
		.eq("order_id", orderId)
		.limit(1);

	if (error) throw error;
	if (data?.length) return;

	console.log(`${LOG} repairing an order with no items`, { orderId });
	await insertOrderItems(payload, orderId);
}
