import { shopifyFetch } from "./client";
import {
	getAllProductsQuery,
	getProductByHandleQuery,
} from "./queries/products";
import type {
	ShopifyProductCardModel,
	StorefrontProductByHandleData,
	StorefrontProductsQueryData,
} from "./types";
import { mapStorefrontProductsToCards } from "./map-storefront-products";
import { toShopifyLanguage } from "./locale";

export async function getShopifyProductByHandle(
	handle: string,
	locale?: string
): Promise<StorefrontProductByHandleData["product"]> {
	const decoded = decodeURIComponent(handle.trim());
	if (!decoded) return null;

	const { body } = await shopifyFetch<StorefrontProductByHandleData>({
		query: getProductByHandleQuery,
		variables: { handle: decoded },
		language: toShopifyLanguage(locale),
	});

	return body.data?.product ?? null;
}

/** Other catalog products for “related” grid (excludes current handle). */
export async function getShopifyRelatedProductCards(
	excludeHandle: string,
	limit = 4,
	locale?: string
): Promise<ShopifyProductCardModel[]> {
	const { body } = await shopifyFetch<StorefrontProductsQueryData>({
		query: getAllProductsQuery,
		language: toShopifyLanguage(locale),
	});
	const cards = mapStorefrontProductsToCards(body.data);
	const exclude = decodeURIComponent(excludeHandle.trim()).toLowerCase();
	return cards
		.filter((p) => p.handle.toLowerCase() !== exclude)
		.slice(0, limit);
}
