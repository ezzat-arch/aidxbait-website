// lib/shopify/verify-webhook.ts — proving a webhook really came from Shopify
//
// SERVER ONLY (uses node:crypto).

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Whether `rawBody` carries a valid Shopify webhook signature.
 *
 * The body must be the **raw** request text, byte for byte. Parsing and
 * re-serialising it changes key order and whitespace and the HMAC will not match.
 *
 * Admin-created webhooks (Settings → Notifications → Webhooks) are signed with a
 * shop-level secret shown under that list, so no app, Admin API token or OAuth
 * flow is involved.
 *
 * There is deliberately no bypass flag here. The Paymob callback has an
 * `ALLOW_CALLBACKS_WITHOUT_HMAC` escape hatch; do not copy it. An unsigned
 * request to this endpoint can write orders and addresses.
 */
export function isValidShopifyWebhook(
	rawBody: string,
	hmacHeader: string | null,
	secret: string | undefined
): boolean {
	if (!hmacHeader || !secret) return false;

	const expected = createHmac("sha256", secret)
		.update(rawBody, "utf8")
		.digest("base64");

	const expectedBuffer = Buffer.from(expected, "utf8");
	const receivedBuffer = Buffer.from(hmacHeader, "utf8");

	// `timingSafeEqual` throws on a length mismatch, and the length itself is not
	// a secret, so compare it first and only then compare in constant time.
	if (expectedBuffer.length !== receivedBuffer.length) return false;
	return timingSafeEqual(expectedBuffer, receivedBuffer);
}
