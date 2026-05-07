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

export async function getShopifyCollections(): Promise<ShopifyCollectionCardModel[]> {
	const { body } = await shopifyFetch<StorefrontCollectionsQueryData>({
		query: getAllCollectionsQuery,
	});
	return mapStorefrontCollectionsToCards(body.data);
}

export async function getShopifyCollectionByHandle(
	handle: string
): Promise<StorefrontCollectionByHandleData["collection"]> {
	const decoded = decodeURIComponent(handle.trim());
	if (!decoded) return null;

	const { body } = await shopifyFetch<StorefrontCollectionByHandleData>({
		query: getCollectionByHandleQuery,
		variables: { handle: decoded },
	});

	return body.data?.collection ?? null;
}
