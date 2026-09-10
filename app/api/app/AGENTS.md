# Mobile app API (`/api/app/*`)

## Overview

The JSON API a separate mobile app calls. It is not used by this website's own pages, which talk to Supabase directly or through the other route groups. Everything here is stateless: no cookies, no next-intl locale prefix (`middleware.ts` skips all of `/api/`), so a change here is a change to the mobile app's contract.

## Key files

| File | Owns |
|---|---|
| `patient/`, `therapist/`, `therapists/` | Home visit flow: requests, schedules, visits, reviews |
| `store/` | Mobile store: products, cart, favorites, categories, joints |
| `programs/` | Exercise programs, subscriptions, HLS video listings |
| `auth/signup/`, `user/` | Mobile account creation and profile |
| `notifications/`, `locations/`, `specialties/`, `health/` | Supporting lookups and status |
| `@/lib/services/app/*.service.ts` | All business logic; routes stay thin |
| `@/lib/services/app/*.errors.ts` | Typed error to HTTP response mapping |

## Conventions

- Routes parse and validate input, then call a service in `lib/services/app/`. Business logic and Supabase queries live in the service, not the handler.
- Errors are thrown by services as typed errors and turned into responses by that domain's `*.errors.ts` helper (`visitRequestErrorResponse`, `validationError`, and so on). Do not build ad hoc error responses here.
- Responses match the site wide shape: `{ success: true, data }` or `{ success: false, error }`.
- Callers identify themselves with the Supabase user id, as `?supabaseId=<uuid>` on reads and `supabase_id` in the body on writes. A handful of routes (`store/cart`, `store/favorites`, `programs/*`) instead take an `Authorization` bearer token; follow whichever pattern the neighbouring route already uses rather than mixing them.
- Every handler documents its own contract in a JSDoc block above the export: method, path, query or body shape, and the meaning of returned status fields. Keep that block current when you change the shape.
- These routes use `supabaseAdmin` (service role), so they bypass RLS. Validate every input and never trust an id you were handed without checking it belongs to the caller.

## Gotchas

- Signup is a two step operation: create the auth user, then the database rows. If the second step fails the auth user must be deleted, or you leave an orphan account. `auth.service.ts` implements this rollback; copy the pattern for any new multi step write.
- Mobile app users are created with `email_confirm: true` (auto confirmed), unlike website registration.
- Changing a response shape breaks a shipped mobile app that you cannot redeploy. Add fields; do not rename or remove them.
- `/api/aes-key` (outside this folder) serves the raw 16 byte AES key for HLS playback of program videos and is part of the same mobile surface.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
