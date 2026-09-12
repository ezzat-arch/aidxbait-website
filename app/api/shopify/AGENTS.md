# Shopify webhooks

## Overview

Store purchases happen on Shopify's hosted checkout, so Shopify is where a website order first exists. This folder is how it reaches us: an admin created webhook posts the order, and the handler writes it into `orders` and `order_items`, saves the delivery address to the buyer's address book, and keeps a guest's order until they sign in. Everything Shopify side lives in [lib/shopify/](../../../lib/shopify/); this folder is only the receiver.

## Key files

| File | Owns |
|---|---|
| `webhooks/orders/route.ts` | Both `orders/create` and `orders/updated`. Verifies, maps, upserts |
| `@/lib/shopify/verify-webhook.ts` | The raw body HMAC check |
| `@/lib/shopify/map-webhook-order.ts` | Pure payload to columns mapping, including the status mapping |
| `@/lib/shopify/map-order-address.ts` | Shopify address to `patient_addresses`, plus the dedupe fingerprint |
| `@/lib/orders/save-shopify-address.ts` | Writes an address once, returns the existing one otherwise |
| `@/lib/orders/claim-guest-orders.ts` | Attaches guest orders to an account on read |

## Conventions

- Read `await request.text()` and verify before parsing. The HMAC is over those exact bytes, so parsing and re serialising breaks it.
- Check both the signature and `X-Shopify-Shop-Domain`. Either one wrong is a `401` and nothing is written.
- There is no bypass flag, and none may be added. The Paymob callback has one; do not copy it here. An unsigned request to this route can write orders and addresses.
- Status codes are the protocol. `401` for a bad signature. `200` for a payload that cannot be mapped, because Shopify would only ever resend the identical body. `500` for a database error, because that is what makes Shopify retry (8 times over 4 hours) instead of the order being lost.
- Register the webhook at exactly `https://www.doctoory.com/api/shopify/webhooks/orders/`. `trailingSlash: true` in `next.config.mjs` answers every other spelling with a 308, and Shopify does not follow redirects.
- Log with a `[Shopify Webhook]` prefix and no personal data. Order id, order name, topic and `source_name` are enough.
- Shopify gives roughly five seconds. Keep the handler to a few queries plus the one Storefront call, which carries its own two second timeout.

## Gotchas

- The payload is the REST Admin Order JSON, a different shape from the Storefront GraphQL used everywhere else in the app. Its types are in `@/lib/shopify/webhook-types.ts`.
- `note_attributes` entries are `{ name, value }`, not `{ key, value }`. The patient id our cart attaches is a hint only: Shopify drops cart attributes on accelerated checkouts, so a signed in buyer's order can arrive without one.
- Line items carry no product handle and no image. They are fetched separately by `getVariantSnapshots`, and the order still lands if that call fails.
- `variant_id` is null for a deleted variant and for a custom line a merchant typed by hand. Those orders must still be stored, which is why the one catalog CHECK allows both id columns to be null.
- Email matching uses `.ilike`, and `_` and `%` are LIKE wildcards (`_` is common in addresses), so the result is filtered down to an exact lowercase match before it is trusted.
- The admin's "Send test notification" button writes a real row into the live database from a fake payload. Delete it after testing.
- `npx tsx scripts/check-shopify-webhook.ts` exercises the HMAC, the status mapping and the address fingerprint with no store and no database.
