# Verify: Shopify hosted checkout · spec 0001 · updated 2026-09-10
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Phase 1 steps need `.env.local` with `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `npm run dev`. Steps marked "needs Phase 0" also need the matching Shopify admin change.

## UI / manual

### Phase 1: storefront foundation
- [ ] Open a product under `/ar/services/store/products/<handle>`, click Buy → Shopify checkout renders in Arabic → AC-2
- [ ] Open the same product under `/services/store/products/<handle>`, click Buy → checkout renders in English → AC-2
- [ ] Signed out, click Buy → checkout opens with no login prompt (needs Phase 0 step 1, "Accounts are optional") → AC-3 (guest)
- [ ] Signed in with a saved primary address, click Buy → checkout arrives with email, phone, first and last name, street on line 1, `Bldg …, Floor …, Apt …` on line 2, and city filled; governorate is left for the buyer to pick → AC-3
- [ ] Signed in with no saved address, click Buy → email, phone and name filled, address blank, no error → AC-3
- [ ] Signed in as a user whose `users.phone_number` is `0100 123 4567` → checkout shows `+201001234567` → value sourcing, phone row
- [ ] Signed in as a user whose phone is junk (`abc`) → phone field blank, checkout still opens → value sourcing, phone row
- [ ] Pick a sold out variant, click Buy → the translated `checkout_error` message shows; server log has `[Checkout] Shopify refused the cart` → error path
- [ ] Put an invalid email on a test user's `users` row, click Buy → checkout still opens; server log has `cartCreate with pre-fill failed, retrying without it` → key invariant (pre fill never blocks a purchase)
- [ ] With `SHOPIFY_CHECKOUT_DOMAIN=shop.doctoory.com` set and the domain live (needs Phase 0 step 2) → the checkout URL host is `shop.doctoory.com` → AC-1 (partial)

### Phase 2: real multi item cart
- [ ] Signed out, open a multi variant product, pick each option, add to cart, then add a second product → the navbar badge counts both → AC-3
- [ ] Reload the page → the cart still holds both lines and the badge matches, with no hydration warning in the console → localStorage only
- [ ] Open the cart, raise a quantity, lower it to zero → the line goes; the summary shows a subtotal and the line about taxes and shipping at checkout, with no invented tax or shipping figure
- [ ] Signed out, click Proceed to checkout → Shopify checkout opens with every line and no login prompt, never a redirect to `/login` → AC-3
- [ ] Same in `/ar` → the sheet, the steppers and the close button all sit correctly right to left → i18n rules
- [ ] Kill the network, click Proceed to checkout → a destructive toast appears and the cart stays intact → error path

### Phase 3: webhook, saved addresses, My Orders, guest claim
- [ ] After paying, the address appears in `/profile/addresses` and the order in `/profile/my-orders` with its Shopify name and a Track order link → AC-4
- [ ] Fulfil that order in Shopify admin → My Orders shows it shipped with no action on our side → `orders/updated`
- [ ] Check out again as that buyer → the address from the order pre fills → AC-4
- [ ] Guest buys with a never seen email, then signs up with it → the order and its address are on the new account → AC-5
- [ ] Guest buys with the email of an account that already exists, then logs in → same result through `getCheckoutPrefill` → AC-5
- [ ] Signed in as user A, open `/api/orders/<an id belonging to user B>/` → 404 → authorisation

### Phase 4: return flow
- [ ] After paying, click Continue shopping → lands on doctoory.com, never on `myshopify.com` (needs Phase 0 steps 2 and 3) → AC-1
- [ ] Order placed in Arabic → the confirmation email arrives in Arabic (needs Phase 0 steps 4 and 5) → AC-2

## Commands

- [ ] `npx tsx scripts/check-shopify-checkout.ts` → prints `check-shopify-checkout: all assertions passed` → value sourcing (phone, address, checkout host rows)
- [ ] `npx tsc --noEmit 2>&1 | grep -E "^(lib/shopify|app/api/checkout|components/store/AddToCartButton)"` → no output → build gate
- [ ] `curl -s -X POST localhost:3000/api/checkout/ -H 'content-type: application/json' -d '{"lines":[{"merchandiseId":"gid://shopify/ProductVariant/<id>","quantity":2}],"locale":"ar"}'` → `{"success":true,"data":{"checkoutUrl":"…"}}` → AC-3 (request shape)
- [ ] Same call with `{"lines":[]}` → HTTP 400, `success: false` → input validation
- [ ] Same call with `"quantity":0` → HTTP 400 → input validation
- [ ] Same call with a body that is not JSON → HTTP 400, not 500 → input validation
- [ ] Same call with a valid session cookie → response identical in shape; server log line `[Checkout] cart created` shows `prefilled: true` → AC-3

- [ ] `npx tsx scripts/check-cart.ts` → prints `check-cart: all assertions passed` → Phase 2 cart logic
- [ ] `npx tsx scripts/check-shopify-webhook.ts` → prints `check-shopify-webhook: all assertions passed` → Phase 3 HMAC, status mapping, address fingerprint
- [ ] `curl -s -o /dev/null -w '%{http_code}' -X POST https://www.doctoory.com/api/shopify/webhooks/orders/` → `401`, never a 3xx → Phase 3 webhook URL is not a redirect

## Acceptance-criteria coverage

- AC-1 · covered by the checkout host step (partial, Phase 1) and the "Continue shopping" step (Phase 0)
- AC-2 · covered by the two language steps (Phase 1) and the Arabic email step (Phase 0)
- AC-3 · covered by the guest, saved address, no address, phone and curl steps (Phase 1)
- AC-4 · covered by the saved address, fulfilment and re checkout steps (Phase 3)
- AC-5 · covered by the two guest claim steps (Phase 3)
