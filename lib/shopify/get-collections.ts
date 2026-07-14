import { shopifyFetch } from "./client";
import {
	getAllCollectionsQuery,
	getCollectionByHandleQuery,
} from "./queries/products";
import type {
	ShopifyCollectionCardModel,
	StorefrontCollectionByHandleData,
	StorefrontCollectionsQueryData,
} from "./types";
import { mapStorefrontCollectionsToCards } from "./map-storefront-collections";
import { toShopifyLanguage } from "./locale";

export async function getShopifyCollections(
	locale?: string
): Promise<ShopifyCollectionCardModel[]> {
	const { body } = await shopifyFetch<StorefrontCollectionsQueryData>({
		query: getAllCollectionsQuery,
		language: toShopifyLanguage(locale),
	});
	return mapStorefrontCollectionsToCards(body.data);
}

export async function getShopifyCollectionByHandle(
	handle: string,
	locale?: string
): Promise<StorefrontCollectionByHandleData["collection"]> {
	const decoded = decodeURIComponent(handle.trim());
	if (!decoded) return null;

	const { body } = await shopifyFetch<StorefrontCollectionByHandleData>({
		query: getCollectionByHandleQuery,
		variables: { handle: decoded },
		language: toShopifyLanguage(locale),
	});

	return body.data?.collection ?? null;
}
