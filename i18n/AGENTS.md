# Internationalisation and RTL

## Overview

The site ships in English and Arabic, and Arabic is right to left, so translation and direction are not optional extras here: every page lives under `app/[locale]/` and every visible string comes from a message file. This folder holds the next-intl configuration; the strings themselves live in `messages/`.

## Key files

| File | Owns |
|---|---|
| `routing.ts` | Locales (`en`, `ar`), default locale, `localePrefix: "as-needed"`, detection |
| `request.ts` | Per request locale resolution, message loading, `Africa/Cairo` timezone |
| `navigation.ts` | Locale aware `Link`, `redirect`, `usePathname`, `useRouter` |
| `../messages/en.json`, `../messages/ar.json` | The translations, nested by namespace |
| `../lib/i18n/utils.ts`, `../lib/i18n/data-utils.ts` | Locale helpers for text and data |
| `../scripts/extract-strings.js` | Finds hardcoded strings and writes `STRINGS.json` |
| `../STRINGS.json` | Staging list of extracted strings awaiting Arabic translation |

## Commands

```bash
# Scan app/ components/ contexts/ hooks/ lib/ for hardcoded UI strings
npm run extract:strings
```

## Conventions

- Import `Link`, `redirect` and `useRouter` from `@/i18n/navigation`, never from `next/link` or `next/navigation`. The wrappers keep the locale prefix; the plain versions drop it and send Arabic users to the English page.
- `localePrefix` is `as-needed`, so English URLs have no `/en` prefix and Arabic ones have `/ar`. Do not hardcode either prefix into a path.
- Message keys are namespaced `<area>.<source>.<kind>.<snake_case_name>`, for example `store.CartSidebar.text.clear_all` or `profile.addresses.attr.placeholder.enter_city`. `kind` is `text` for content, `attr.<attribute>` for `alt`, `title`, `placeholder` and `aria-label`, and `toast.*` / `data.*` for those cases.
- Read them with a namespaced hook: `const t = useTranslations("login.text")`, then `t("welcome_back")`.
- Add every new key to both `en.json` and `ar.json`. A key present in only one file falls back visibly and looks broken in the other language.
- Layouts use logical spacing (`ps-*`, `pe-*`, `ms-*`, `me-*`) or `ltr:` / `rtl:` variants. A bare `pl-4` or `ml-auto` will be wrong in Arabic.
- Direction is set once, on `<html dir>` in `app/[locale]/layout.tsx`. RTL helpers such as `.rtl-mirror` and the `[dir="rtl"]` rules live in `app/globals.css`.
- Icons and arrows that point somewhere need mirroring in Arabic (`rtl:rotate-180` or `.rtl-mirror`).

## Gotchas

- `STRINGS.json` is not loaded by the app. It is the output of `npm run extract:strings`, a worklist of strings found hardcoded in components, with an empty `ar` field to be filled. Translating there does nothing until the entries are moved into `messages/en.json` and `messages/ar.json`.
- The extractor skips `app/api`, so API responses are never translated. Any user facing text an API returns has to be a key the client translates, not English prose from the server.
- Re-running the extractor rewrites `STRINGS.json` wholesale and logs deduplicated entries to `extract-strings.report.txt`. Both are generated; do not hand edit them.
- Times and dates render in `Africa/Cairo` (set in `request.ts`), not the visitor's timezone.
- `middleware.ts` runs next-intl and Supabase together. Adding a path that must skip localisation means updating the middleware `matcher`, not just adding a route.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
