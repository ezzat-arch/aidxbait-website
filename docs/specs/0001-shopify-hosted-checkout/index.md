# 0001 · Shopify hosted checkout: return to site, confirmation email, no second login, saved checkout info

**Status**: In Progress
**Date**: 2026-09-09
**Deliberated in**: the `/architect` session of 2026-09-09 (plan approved by the engineer; this file is that plan made durable).
**Rationale**: [rationale.md](rationale.md) (context, options considered, why SSO is closed)
**Verify**: [verify.md](verify.md) (checklist `/check verify` runs, `/test` locks)

## Decision

Keep Shopify's hosted checkout as the payment processor and system of record. Fix everything around it.

On a non Plus plan, true single sign on is closed: Multipass is Plus only and dead on new customer accounts, OIDC federation is Plus only, `customerAccessTokenCreate` was removed in API 2025-04. The buyer visible equivalent, no login wall plus a fully pre filled checkout, is what gets built.

Decisions taken with the engineer:
- Guest checkout plus pre fill, not SSO.
- Redirect theme plus custom checkout domain for the return flow (no thank you page extension).
- A real multi item Shopify cart (rewire the orphaned `CartProvider`).
- Shopify orders surfaced in My Orders through the order webhook.
- Guest orders are captured, not discarded, and claimed on sign up.

## Requirements

- **AC-1** After completing checkout the buyer can get back to doctoory.com in one click, and never sees a `myshopify.com` address.
- **AC-2** The buyer receives Shopify's order confirmation email, in Arabic when they ordered in Arabic.
- **AC-3** A buyer signed in to doctoory.com reaches a checkout with no login wall and with name, email, phone and address already filled. A guest reaches the same checkout with no login wall.
- **AC-4** The address a buyer enters at checkout is saved to their Doctoory account and pre fills their next checkout; the order appears in My Orders.
- **AC-5** A guest's order and address are kept, keyed by email, and attached to their account the moment they sign up (or sign in) with that email.

## Feature design

### Phase 0: Shopify admin (no code)

1. **Done 2026-09-10.** Settings → **Checkout** → Customer contact method → leave "Require customers to sign in to their account before checkout" **unchecked** (removes the login wall; AC-3). The old three way "Accounts are disabled / optional / required" choice no longer exists on stores using new customer accounts; this checkbox replaced it, and it lives on the Checkout page, not the Customer accounts page. The "Show sign-in links" toggle on Settings → Customer accounts is unrelated: it only offers a sign in link, it does not require one, so it can stay on.
2. Settings → Domains → add `shop.doctoory.com`, CNAME to `shops.myshopify.com`, set as primary (AC-1). **Done 2026-09-10.** Note for step 6 and for the env: making this the primary domain does not change what `X-Shopify-Shop-Domain` carries on a webhook, which is always the permanent `{shop}.myshopify.com`. `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` must stay that myshopify domain.
3. Publish `Shopify/hydrogen-redirect-theme` to the Online Store with `storefront_hostname = www.doctoory.com` (the canonical host, so the buyer does not take an extra redirect hop); remove the storefront password (AC-1).
4. Diagnose the missing email before building: are there completed orders at all? Is "Order confirmation" enabled? Is the sender domain authenticated? (AC-2) **Done 2026-09-10: notifications tested and arriving.**
5. Settings → Languages → publish Arabic; do not customise the notification template (AC-2). **Done 2026-09-10: Arabic was already published.**
6. Settings → Notifications → Webhooks → create two, both JSON and both pointing at `https://www.doctoory.com/api/shopify/webhooks/orders/`: event `Order creation` and event `Order update`. The canonical `www` host and the trailing slash are both required, because `trailingSlash: true` in `next.config.mjs` answers any other spelling with a 308 and Shopify does not follow redirects. Copy the shop level signing secret to `SHOPIFY_WEBHOOK_SECRET` (AC-4, AC-5). No Shopify app or Admin token is needed. **Done 2026-09-10, ahead of the route being deployed.** Consequence: deliveries fail with a 404 until the code ships, and Shopify deletes a subscription after sustained consecutive failures, so this is now on a clock. Nothing fires until an order is actually placed, and any order placed in the gap can be recovered after deploy by editing it in Shopify admin, which fires `orders/updated`; the handler upserts, so an update for an order it has never seen creates it. `Order update` matters as much as `Order creation`: fulfilment, cancellation and refunds only ever arrive on it, so without it My Orders would freeze every order at its creation status.

### Phase 1: Storefront foundation (AC-2, AC-3)

Value sourcing:

| Value | Source |
|---|---|
| Storefront API version | `SHOPIFY_STOREFRONT_API_VERSION = "2026-07"` in `lib/shopify/client.ts` (latest stable; the old `2024-04` pin was past its window and falling forward) |
| Checkout language, order email language | `@inContext(language:)` on `cartCreate`, from the request `locale` (documented by Shopify; there is no `?locale=` parameter) |
| Market / currency at checkout | `buyerIdentity.countryCode = "EG"` (`SHOPIFY_STORE_COUNTRY_CODE`), always, guests included |
| Buyer email, phone, names | `users` row by `supabase_id` (auth email as fallback) |
| Patient id (cart attribute `__doctoory_patient_id`) | `patients.id` by `users.id` |
| Delivery address | `patient_addresses`, primary first, else newest; `street → address1`, building/floor/apartment composed into `address2`, `city → city`, governorate left for the buyer (free text, Shopify wants ISO codes) |
| Phone format | `toE164EgyptPhone`; unnormalisable numbers are omitted |
| Address validation | `validationStrategy: COUNTRY_CODE_ONLY` (no postal codes in Egypt) |
| Checkout host | `SHOPIFY_CHECKOUT_DOMAIN` rewrite, only for `*.myshopify.com` hosts |
| Session | Supabase cookie session in the route handler; missing session = guest, never a 401 |
| Request shape | `{ lines: [{ merchandiseId, quantity }], locale }`; caps 50 lines, 99 per line |

Key invariant: a pre fill problem never blocks a purchase. If Shopify rejects a cart carrying pre fill for any reason other than the lines themselves, the cart is created again bare.

### Phase 2: Real multi item cart (AC-3)

The product query asks for `variants(first: 1)`, so every multi variant product silently sells variant one. It becomes `variants(first: 100)` plus `options { name optionValues { name } }`, with a new `mapStorefrontProductToDetail` beside the card mapper. `quantityAvailable` is deliberately not requested: it needs the `unauthenticated_read_product_inventory` scope, and without that scope Shopify answers with an `ACCESS_DENIED` error that `shopifyFetch` throws on, which would take every product page down. Stock is `availableForSale`, and Shopify caps over ordered quantities at cart creation.

The cart becomes localStorage only under a new key `doctoory_cart_v2`, holding Shopify lines keyed by `variantId`. The `user_cart` sync goes (its `product_id` is an INTEGER foreign key that cannot hold a Shopify global id, and the website only ever wrote it), and `app/api/cart/*` goes with it. The reducer, the totals and `resolveVariant` move into a pure `lib/cart/cart-reducer.ts` so a script can exercise them; the context becomes a thin wrapper that hydrates in a mount effect behind a `hydrated` flag, so the server rendered navbar badge cannot mismatch and the first commit cannot overwrite storage with an empty cart.

`CartSummary` shows the subtotal only, plus a line saying taxes and shipping are worked out at checkout. It does not use `calculateOrderTotals`: those 14 percent and 50 EGP constants belong to the Paymob flow, Shopify computes the real figures, and a sidebar number that can disagree with the checkout is worse than no number. `CartSidebar` drops its guest login redirect (guests must reach checkout) and posts every line to `/api/checkout/`. A new `ProductPurchasePanel` handles variant choice and quantity on the product page.

### Phase 3: Webhook to saved addresses, My Orders, guest claim (AC-4, AC-5)

There is no DDL for `orders`, `order_items` or `patient_addresses` in the repo and PostgREST cannot read `information_schema`, so the phase opens with a SQL snippet run by hand in the Supabase SQL editor. Three answers gate the migration: whether the address foreign keys on `orders` are NOT NULL, the exact enum labels, and the `VARCHAR` lengths on `patient_addresses`.

Migration `011` then makes `order_items.product_id` nullable and adds Shopify columns and snapshot columns, with a `CHECK` that never allows both catalogs at once while still allowing both to be null (deleted variants arrive as `variant_id: null` and must still land). On `orders` it makes `patient_id` and both address foreign keys nullable and adds `channel`, `locale`, `shopify_order_id`, `shopify_order_name`, `shopify_order_status_url`, `shopify_updated_at`, `guest_email` and `guest_shipping_address`. Shopify ids are 64 bit, so every id column is TEXT in global id form.

One webhook route serves both `orders/create` and `orders/updated`. It verifies the raw body HMAC and the shop domain before parsing, answers 401 on a bad signature, 200 on a payload it cannot map (Shopify would only resend the same thing) and 500 on a database error (so Shopify retries rather than losing the order). It upserts by `shopify_order_id`, falls through to update on a unique violation, and refuses a delivery older than the stored `shopify_updated_at`. A matched buyer gets the address written to `patient_addresses` with a fingerprint dedupe; a guest keeps the order with `guest_email` and the raw address. `claimGuestOrders` runs on read, from `GET /api/orders` and from `getCheckoutPrefill`, so every sign in path is covered without patching four sign up flows.

The same phase closes two existing holes on the surfaces this makes valuable: `GET /api/orders/[id]` applies its patient filter only when a patient id is supplied, and `/api/orders` and `/api/addresses` trust a client supplied `patient_id`. Both derive the patient from the session instead.

### Phase 4: Return flow polish and end to end proof

Redirect theme path rules, an Arabic confirmation email proved end to end, and the Paymob callback pointed at the order page instead of the deleted store banner. The earlier `?payment=success` banner is dropped: with Shopify checkout the buyer returns through the redirect theme with no payment parameter.

## Build plan

### Phase 1 (satisfies AC-2 language path, AC-3 pre fill), built 2026-09-09
- [x] Pin `SHOPIFY_STOREFRONT_API_VERSION = "2026-07"` in `lib/shopify/client.ts`; add `SHOPIFY_STORE_COUNTRY_CODE` to `locale.ts`
- [x] Cart input/payload types in `lib/shopify/types.ts`; `cartCreate` mutation in `lib/shopify/queries/cart.ts` with `@inContext(language:)`
- [x] `lib/shopify/checkout-url.ts` (`toCheckoutDomain`)
- [x] `lib/shopify/map-checkout-prefill.ts` (`buildPrefilledCartInput`, `toE164EgyptPhone`, `composeAddress2`)
- [x] `lib/shopify/checkout-prefill.ts` (`getCheckoutPrefill`, server only, degrades never throws)
- [x] `lib/shopify/create-cart.ts` (`createShopifyCart` with bare retry)
- [x] Rewrite `app/api/checkout/route.ts`: multi line body, locale, session pre fill, guest fallback, house response shape
- [x] `components/store/AddToCartButton.tsx` sends the new shape with `useLocale()`
- [x] `env.example` / `.env.example` list the Shopify vars; `lib/shopify/AGENTS.md` updated
- [x] `scripts/check-shopify-checkout.ts` passes; `npx tsc --noEmit` reports no errors in Phase 1 files (226 pre existing errors elsewhere are the baseline). `npm run lint` could not run: ESLint is not declared or configured in this repo.
- [ ] Live check against the real store once `.env.local` has the Shopify vars (see [verify.md](verify.md)); not possible in this environment

### Phase 2, built 2026-09-10
- [x] Sync this spec's Phase 2 to 4 sections and `verify.md` to the approved plan
- [x] Product query: `options { name optionValues { name } }` and `variants(first: 100)`; `mapStorefrontProductToDetail`
- [x] `lib/cart/cart-reducer.ts` (pure reducer, totals, `resolveVariant`); `lib/shopify/cart-limits.ts`
- [x] Cart context rewritten on `CartLine`, localStorage only, hydrate in a mount effect; `lib/cart/cart-service.ts` on key `doctoory_cart_v2`
- [x] `CartItem`, `CartSummary` (subtotal only), `CartSidebar` (no guest redirect, posts to `/api/checkout/`)
- [x] `ProductPurchasePanel` on the product page in place of `AddToCartButton`
- [x] en and ar strings; RTL pass including the sheet close button
- [x] Superseded code removed (`app/api/cart/*`, the orphaned Supabase catalog tree, the Paymob web routes with no caller, the old checkout page)
- [x] `scripts/check-cart.ts` passes; `npx tsc --noEmit` clean in touched files

### Phase 3, code built 2026-09-10
- [x] Live schema read: **no longer a separate step.** Migration `011` verifies the columns, the `patient_addresses` widths the address mapper truncates to, and every enum label the webhook writes, raising an exception naming whatever is wrong. Running it answers what the snippet would have.
- [x] Migration `011_shopify_orders.sql` applied in the Supabase SQL editor and its own verification passed (2026-09-10)
- [x] `lib/shopify/verify-webhook.ts`, `map-order-address.ts` with `addressFingerprint`, `get-variant-snapshots.ts`
- [x] `app/api/shopify/webhooks/orders/route.ts` serving both topics
- [x] `lib/orders/claim-guest-orders.ts` wired into `GET /api/orders` and `getCheckoutPrefill`
- [x] `lib/auth/get-session-patient.ts`; `/api/orders` and `/api/addresses` authorised from the session; `POST /api/orders` and `PATCH /api/orders/[id]` deleted
- [x] My Orders reads the snapshot columns, links to Shopify tracking, fixes the paid badge
- [x] `scripts/check-shopify-webhook.ts` passes

### Phase 4
- [x] Paymob callback redirect points at the order page instead of the removed store banner (2026-09-10)
- [ ] Redirect theme path rules in Shopify (needs Phase 0 steps 2 and 3)
- [ ] Arabic confirmation email proved end to end (needs Phase 0 steps 4 and 5)
- [ ] Final `/sync` of the `AGENTS.md` files once the store settings are live

## Consequences

- Not real SSO: no Shopify session is created; the buyer just never sees a login.
- "Continue shopping" is one click back, not an automatic redirect; its label cannot change on non Plus.
- No cross device web cart (localStorage only).
- Shopify's own confirmation email is used (bilingual, free); it links to Shopify's order status page.
- Guest identity is email only; a typo'd email leaves an unclaimed order with `patient_id NULL`.
- `next.config.mjs` ignores type and lint errors at build time, so `npx tsc --noEmit` filtered to touched files is the real gate; `npm run lint` is not usable until ESLint is configured.
