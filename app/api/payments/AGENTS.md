# Payments (Paymob)

## Overview

Paymob is the Egyptian payment gateway the mobile app checks out through. The website no longer does: store purchases go to Shopify's hosted checkout (see [lib/shopify/AGENTS.md](../../../lib/shopify/AGENTS.md)), so the web intention, verify and debug routes were removed once their only caller, the old store checkout page, went. What is left is the mobile flow plus the shared callback the Paymob dashboard points at. Money handling and an external callback meet here, so treat every change as security sensitive.

## Key files

| File | Owns |
|---|---|
| `paymob/callback/route.ts` | Paymob's redirect and webhook landing point; verifies HMAC, settles the order |
| `paymob/mobile/*` | The same flow for the mobile app (`intention`, `confirm`, `callback`) |
| `@/lib/paymob/paymob-service.ts` | All Paymob HTTP calls, types and `verifyHMAC` |
| `@/app/api/checkout/route.ts` | Not Paymob. Creates a Shopify cart and returns its hosted checkout URL; see `lib/shopify/AGENTS.md` |

## Conventions

- Never call Paymob's HTTP API from a route. Everything goes through `lib/paymob/paymob-service.ts`, which owns authentication, order creation, payment keys and HMAC.
- Every callback is verified before it is trusted. `ALLOW_CALLBACKS_WITHOUT_HMAC` is `false` (strict) and should stay that way; flipping it accepts unsigned callbacks.
- Order state changes only from a verified callback, never from a redirect query string the browser could have edited.
- Configuration comes from environment variables only: `PAYMOB_API_KEY`, `PAYMOB_SECRET_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_IFRAME_ID`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_HMAC_SECRET`. No keys in code, none in logs.
- Log with the `[Paymob]` prefix and log amounts and ids, never keys, tokens or full card data.

## Gotchas

- `PAYMOB_HMAC_SECRET` is a different key from `PAYMOB_SECRET_KEY`, issued separately in the Paymob dashboard. The code falls back to the secret key if it is unset, which will silently fail verification once the account uses distinct keys. Set both.
- Paymob sends amounts in piastres (cents), not pounds. A missing or doubled factor of 100 is the classic bug in this flow.
- Paymob may hit the callback more than once for one transaction, so settling an order has to be safe to run twice.
- The website flow and the mobile flow are separate route trees with separate callbacks. A fix in one is usually needed in the other.

## Related docs

- `docs/paymob.md`, `docs/paymob-implementation-summary.md`, `docs/PAYMOB_SETUP_CHECKLIST.md`

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
