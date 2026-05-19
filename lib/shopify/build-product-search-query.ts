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
