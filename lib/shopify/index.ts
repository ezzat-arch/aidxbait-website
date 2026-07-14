/** Shopify Storefront API — client + GraphQL queries */

export type { ShopifyGraphQLError, ShopifyGraphQLResponse } from "./client";
export { shopifyFetch } from "./client";
export type { ShopifyLanguageCode } from "./locale";
export { toShopifyLanguage } from "./locale";
export * from "./queries";
export type {
	ShopifyProductCardModel,
	StorefrontProductsQueryData,
	ShopifyCollectionCardModel,
	StorefrontCollectionsQueryData,
	StorefrontCollectionByHandleData,
} from "./types";
export { mapStorefrontProductsToCards } from "./map-storefront-products";
export { mapStorefrontCollectionsToCards } from "./map-storefront-collections";
export {
	getShopifyProductByHandle,
	getShopifyRelatedProductCards,
} from "./get-product-by-handle";
export {
	getShopifyCollections,
	getShopifyCollectionByHandle,
} from "./get-collections";
