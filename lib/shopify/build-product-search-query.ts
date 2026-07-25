/**
 * Builds a Storefront API `products(query:)` string.
 * @see https://shopify.dev/docs/api/usage/search-syntax
 */
export function buildShopifyProductSearchQuery(
	searchTerm: string,
	collectionHandle: string | null
): string {
	const term = searchTerm.trim();
	if (!term) return "";

	if (collectionHandle && collectionHandle !== "all") {
		return `collection:${collectionHandle} ${term}`;
	}

	return term;
}

/**
 * Builds a Storefront API `products(query:)` string that filters by a product
 * tag (used by the body-map: clicking a body part maps to a joint, which we
 * match against Shopify product tags, e.g. `tag:'shoulder'`). Optionally scoped
 * to a collection. Returns "" when no tag is given.
 * @see https://shopify.dev/docs/api/usage/search-syntax
 */
export function buildShopifyTagSearchQuery(
	tag: string,
	collectionHandle: string | null
): string {
	const cleaned = tag.trim();
	if (!cleaned) return "";

	// Quote the tag so multi-word or hyphenated tags match exactly.
	const tagClause = `tag:'${cleaned.replace(/'/g, "")}'`;

	if (collectionHandle && collectionHandle !== "all") {
		return `collection:${collectionHandle} ${tagClause}`;
	}

	return tagClause;
}
