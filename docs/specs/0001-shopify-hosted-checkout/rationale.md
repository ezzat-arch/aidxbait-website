# 0001 · Rationale

Decision record for [index.md](index.md). Read this for the why; the build spec lives in the index.

## Context

Four reported problems (buyer stranded on Shopify after checkout, no confirmation email, a second login demanded at checkout, checkout details never saved) share one root cause. The web store's only buy button (`components/store/AddToCartButton.tsx`) created a one line Shopify cart through `app/api/checkout/route.ts` and sent the browser to Shopify's hosted checkout with no buyer identity, no locale, and `quantity` hardcoded to 1. From that moment the purchase was on Shopify's domain, in Shopify's identity system, in Shopify's order store.

A complete alternative checkout already exists in the repo and is orphaned: `CartProvider`, `CartSidebar` and `CartIcon` are mounted on every page but the cart can never be filled, because the components that call `addToCart` have no importers (they read the legacy Supabase catalog the site stopped showing when Shopify landed). The Paymob flow, the `orders` tables and the My Orders pages behind it all still work; only the mobile app reaches them.

Guests are a first class path, not an edge case: buying without an account happens often.

The store is on a Basic / Grow / Advanced plan, not Shopify Plus. No order confirmation email reaches customers today.

## Options considered

**A. Keep Shopify's hosted checkout and fix around it (chosen).** Shopify stays the payment processor and the system of record. Return to site comes from a custom checkout domain plus Shopify's own `hydrogen-redirect-theme` (works on every plan). The email is Shopify's, made Arabic by publishing Arabic and passing the language on `cartCreate`. The login wall is an admin setting ("Accounts are optional") plus pre filling the cart from the Doctoory account. Saved info comes back through an admin created `orders/create` webhook, which needs no Shopify app, Admin token or scopes. Cost: a real cart has to be wired (the orphaned one, retyped), and two of the asks are met in their buyer visible form rather than literally (one click back instead of an automatic redirect; no login instead of SSO).

**B. Own the checkout on doctoory.com with Paymob, Shopify as catalog only.** Tempting because the cart, checkout page, Paymob callback and My Orders already exist and are orphaned. Rejected: it rebuilds checkout (tax, shipping, discounts, fraud, inventory reservation) and needs an Admin API push of every order back into Shopify to keep fulfilment there. A larger total system for the same four outcomes, and it loses Shop Pay and Shopify's own fraud analysis. Worth revisiting only if Shopify checkout proves unable to take payment in Egypt.

**C. True single sign on into Shopify.** Not available on this plan. Multipass is Plus only and unsupported on new customer accounts, which became the only kind when legacy password accounts were deprecated in February 2026. OIDC identity provider federation is documented as Plus only. `customerAccessTokenCreate` (the old email and password mutation that could mint a Shopify session from our own login) was removed in API version 2025-04. A Customer Account API token placed in `buyerIdentity.customerAccessToken` is reported broken and needs the buyer to authenticate with Shopify first anyway. What small non Plus stores that appear to have SSO actually have is one identity system (Shopify's) rather than two; Doctoory has Supabase for patients and Shopify for store customers, and bridging the two is what is gated behind Plus.

## Verified facts the design leans on

- Shopify's API versioning page (September 2026): `2026-07` is the latest stable; a request naming a retired version "falls forward" to the oldest live one. The repo's `2024-04` pin was retired.
- Shopify's "Support multiple languages on storefronts" guide: `@inContext(language:)` on `cartCreate` sets the language the checkout at `checkoutUrl` loads in. No query parameter exists for this.
- `CartDeliveryAddressInput` fields: `firstName`, `lastName`, `address1`, `address2`, `city`, `provinceCode`, `countryCode` (enum), `zip`, `phone` (E.164), `company`. Default `validationStrategy` is `COUNTRY_CODE_ONLY`.
- Thank you page checkout UI extensions are available on all plans except Starter, but cannot remove or relabel the native "Continue shopping" button (no DOM access). Not built; the redirect theme covers the need.
- `checkout.liquid` on Thank you and Order status pages was sunset for non Plus stores on 26 August 2026.
- Admin created webhooks are signed with a shop level secret shown under Settings → Notifications → Webhooks, and can be verified without an app.

## References

- https://shopify.dev/docs/api/usage/versioning
- https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets/multiple-languages
- https://shopify.dev/docs/api/storefront/latest/input-objects/CartDeliveryAddressInput
- https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate
- https://shopify.dev/docs/api/customer-authentication/single-sign-on
- https://github.com/Shopify/hydrogen-redirect-theme
- https://shopify.dev/docs/api/checkout-extensions
- https://help.shopify.com/en/manual/fulfillment/setup/notifications/webhooks
