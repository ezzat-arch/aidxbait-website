// lib/shopify/locale.ts — map app locales to Shopify Storefront LanguageCode

/**
 * Shopify Storefront `LanguageCode` enum values we use.
 * @see https://shopify.dev/docs/api/storefront/latest/enums/LanguageCode
 */
export type ShopifyLanguageCode = "EN" | "AR";

/**
 * Convert an app locale (from `i18n/routing.ts`: "en" | "ar") into the
 * Shopify Storefront `LanguageCode` used by the `@inContext` directive.
 * Falls back to English for unknown locales.
 */
export function toShopifyLanguage(locale: string | undefined | null): ShopifyLanguageCode {
	return locale?.toLowerCase().startsWith("ar") ? "AR" : "EN";
}

/**
 * BCP-47 tag for the `Accept-Language` header (belt-and-braces alongside the
 * `@inContext` directive so the API resolves the right translation).
 */
export function toAcceptLanguage(language: ShopifyLanguageCode): string {
	return language === "AR" ? "ar" : "en";
}
