# Shopify Storefront integration

## Overview

Store products and collections come from Shopify's Storefront GraphQL API, not from Supabase, and purchases go through Shopify's hosted checkout. This folder is the only place that talks to Shopify: it fetches, maps the raw GraphQL shapes into the small view models the store components use, handles Arabic translation and search, and creates the cart that hands the buyer to checkout. Import everything through `lib/shopify` (the `index.ts` barrel), with one server only exception noted below.

## Key files

| File | Owns |
|---|---|
| `client.ts` | `shopifyFetch`, the single HTTP entry point, caching, `Accept-Language`, and the `SHOPIFY_STOREFRONT_API_VERSION` pin |
| `queries/` | The GraphQL documents; nothing else defines queries. `queries/cart.ts` holds `cartCreate` |
| `types.ts` | Raw Storefront response and input types plus the `*CardModel` view models |
| `map-storefront-products.ts`, `map-storefront-collections.ts` | Raw GraphQL to view model |
| `get-product-by-handle.ts`, `get-collections.ts` | Fetch plus map, the functions pages call |
| `locale.ts` | App locale (`en` / `ar`) to Shopify `LanguageCode` (`EN` / `AR`); `SHOPIFY_STORE_COUNTRY_CODE` (`EG`) |
| `build-product-search-query.ts` | Builds the Storefront `products(query:)` string |
| `filter-products-locally.ts` | Arabic aware local text search fallback |
| `cart-limits.ts` | `MAX_LINES`, `MAX_QUANTITY_PER_LINE`, `VARIANT_GID_PREFIX`, shared by the checkout route and the cart UI |
| `create-cart.ts` | `createShopifyCart`: cart plus hosted checkout URL; retries without pre-fill if Shopify rejects it |
| `map-checkout-prefill.ts` | Pure mapping of account data to `CartInput` (buyer identity, delivery address, E.164 phones) |
| `checkout-prefill.ts` | Server only. Looks up a signed in buyer's profile, patient id and saved address. Not in the barrel |
| `checkout-url.ts` | Rewrites `*.myshopify.com` checkout links to `SHOPIFY_CHECKOUT_DOMAIN` when set |
| `webhook-types.ts` | The REST Admin Order shape the order webhook delivers, which is not Storefront GraphQL |
| `verify-webhook.ts` | Server only. Raw body HMAC check for the order webhook. No bypass flag, ever |
| `map-webhook-order.ts` | Pure. Order payload to `orders` and `order_items` columns, including the status mapping |
| `map-order-address.ts` | Pure. Shopify address to `patient_addresses`, plus the dedupe fingerprint |
| `get-variant-snapshots.ts` | One `nodes(ids:)` call for the handle and image the order payload lacks |

## Conventions

- All network calls go through `shopifyFetch`. Do not call the Storefront endpoint directly anywhere else.
- Components never see raw GraphQL nodes. Fetch, map to a `*CardModel` or `ShopifyProductDetailModel`, then render. `getShopifyProductByHandle` returns the mapped detail model, not the raw payload.
- Any localised request passes `language` so `shopifyFetch` sets both the `@inContext(language:)` GraphQL variable and the `Accept-Language` header. Convert with `toShopifyLanguage(locale)`. On `cartCreate` this is also what sets the hosted checkout's language and the order's email language; there is no `?locale=` parameter on `checkoutUrl`.
- Search queries are built by `buildShopifyProductSearchQuery`, which scopes each token to `title:` and `tag:` on purpose. An unfielded term also matches product descriptions and returns noise.
- Configuration is `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` and, optionally, `SHOPIFY_CHECKOUT_DOMAIN` (server only). All three are listed in `env.example`.
- The API version is pinned as `SHOPIFY_STOREFRONT_API_VERSION` in `client.ts` (`2026-07`). Bumping it is a deliberate change, checked against Shopify's changelog. A pin older than a year silently "falls forward" to the oldest live version, so do not let it go stale.
- Every cart carries `buyerIdentity.countryCode: EG`, guests included, so checkout prices in the Egyptian market. A signed in buyer's email, phone and saved address are added on top; a pre-fill Shopify rejects is dropped and the cart created again, never surfaced as a failed checkout.
- Phones sent to Shopify must be E.164. Run them through `toE164EgyptPhone`; a number it cannot normalise is omitted, not sent as is.

## Gotchas

- Responses are cached for `DEFAULT_REVALIDATE_SECONDS` (300). Without it Next.js caches product data forever, so unpublishing or editing a product in Shopify never reaches the site. Pass `revalidate: 0` when you truly need live data, and note that `revalidate` is ignored if you also pass an explicit `cache` mode.
- `checkout-prefill.ts` uses the service role Supabase client. Import it directly in server code and never add it to `index.ts`, which client components import. The webhook modules (`verify-webhook.ts`, `map-webhook-order.ts`, `map-order-address.ts`, `webhook-types.ts`, `get-variant-snapshots.ts`) are left out of the barrel for the same reason: one of them uses `node:crypto`, and none of them belongs in a browser bundle. The receiving route is [app/api/shopify/AGENTS.md](../../app/api/shopify/AGENTS.md).
- Shopify's search index only matches the store's default language, so Arabic searches usually return nothing from the API. That is why `filter-products-locally.ts` exists as a fallback over already fetched (and already translated) cards.
- Arabic matching normalises text: diacritics and tatweel stripped, alef, alef maqsura and taa marbuta unified. Compare with `normalizeSearchText`, never with a raw `includes`.
- `patient_addresses.governorate` is free text, and Shopify's `provinceCode` wants an ISO 3166-2 code, so the delivery pre-fill leaves it out and the buyer picks it at checkout. Building, floor and apartment have no Shopify fields and are composed into `address2`.
- Do not add `quantityAvailable` to a product query. It needs the `unauthenticated_read_product_inventory` scope, and without that scope Shopify answers with an `ACCESS_DENIED` error rather than a null field. `shopifyFetch` throws on any `errors`, so asking for it takes every product page down. Stock is `availableForSale`, and Shopify caps over ordered quantities when the cart is created. If the scope is ever granted, handle a partial `errors` array before adding the field back.
- `next.config.mjs` must allow `cdn.shopify.com` in `images.remotePatterns` for product images to render.
- `npx tsx scripts/check-shopify-checkout.ts` exercises the pure checkout helpers with no store or database; run it after touching `map-checkout-prefill.ts` or `checkout-url.ts`. `npx tsx scripts/check-cart.ts` does the same for the cart core in `lib/cart/cart-reducer.ts`, and `npx tsx scripts/check-shopify-webhook.ts` for the webhook mappers (it also probes the live schema when a `.env.local` is present).

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
