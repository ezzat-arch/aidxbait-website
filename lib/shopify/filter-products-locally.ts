// lib/shopify/filter-products-locally.ts
// Client-side text search over already-fetched (and, under @inContext, already
// translated) product cards. Used as a fallback when Shopify's native
// `products(query:)` returns nothing — notably for Arabic terms, since the
// Storefront search index only matches the store's default language.

import type { ShopifyProductCardModel } from "./types";

/**
 * Normalize a string for loose matching:
 *  - lowercase (English)
 *  - strip Arabic diacritics (tashkeel) and tatweel
 *  - unify alef variants (أ إ آ → ا), alef-maqsura (ى → ي), and taa-marbuta (ة → ه)
 *  - collapse whitespace
 * This lets "جبيرة" match "جبيره"/"الجبيرة" and ignores harmless vowel marks.
 */
export function normalizeSearchText(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFKD")
		// Arabic tashkeel (fatha, damma, kasra, shadda, sukun, tanwin, etc.)
		.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, "")
		// tatweel / kashida
		.replace(/ـ/g, "")
		// alef variants → bare alef
		.replace(/[آأإٱ]/g, "ا")
		// alef maqsura → yaa
		.replace(/ى/g, "ي")
		// taa marbuta → haa
		.replace(/ة/g, "ه")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Filter product cards by a search term, matching against the (possibly
 * localized) title and description. Every whitespace-separated token in the
 * term must appear somewhere in the product's searchable text (AND semantics),
 * mirroring how a user expects multi-word search to behave.
 */
export function filterProductsLocally(
	products: ShopifyProductCardModel[],
	searchTerm: string
): ShopifyProductCardModel[] {
	const normalizedTerm = normalizeSearchText(searchTerm);
	if (!normalizedTerm) return products;

	const tokens = normalizedTerm.split(" ").filter(Boolean);

	return products.filter((product) => {
		const haystack = normalizeSearchText(
			`${product.title} ${product.descriptionPlain ?? ""}`
		);
		return tokens.every((token) => haystack.includes(token));
	});
}
