/** Shopify Storefront API — client + GraphQL queries */

export type { ShopifyGraphQLError, ShopifyGraphQLResponse } from "./client";
export { shopifyFetch, SHOPIFY_STOREFRONT_API_VERSION } from "./client";
export type { ShopifyLanguageCode, ShopifyStoreCountryCode } from "./locale";
export { toShopifyLanguage, SHOPIFY_STORE_COUNTRY_CODE } from "./locale";
export * from "./queries";
export type {
	ShopifyProductCardModel,
	StorefrontProductsQueryData,
	ShopifyCollectionCardModel,
	StorefrontCollectionsQueryData,
	StorefrontCollectionByHandleData,
	StorefrontProductByHandleData,
	StorefrontProductVariantNode,
	ShopifyProductDetailModel,
	ShopifyVariantModel,
	StorefrontCartLineInput,
	StorefrontCartBuyerIdentityInput,
	StorefrontCartDeliveryAddressInput,
	StorefrontCartSelectableAddressInput,
	StorefrontCartInput,
	StorefrontCartPrefillInput,
	StorefrontCartCreateData,
} from "./types";
export {
	mapStorefrontProductsToCards,
	mapStorefrontProductNodeToCard,
	mapStorefrontProductToDetail,
} from "./map-storefront-products";
export { mapStorefrontCollectionsToCards } from "./map-storefront-collections";
export {
	getShopifyProductByHandle,
	getShopifyRelatedProductCards,
} from "./get-product-by-handle";
export {
	getShopifyCollections,
	getShopifyCollectionByHandle,
} from "./get-collections";

// Checkout. `checkout-prefill.ts` is intentionally absent: it uses the
// service-role Supabase client and this barrel is imported by client
// components. Server code imports it directly.
export type { CheckoutPrefill } from "./map-checkout-prefill";
export {
	buildPrefilledCartInput,
	composeAddress2,
	toE164EgyptPhone,
	PATIENT_ID_CART_ATTRIBUTE,
} from "./map-checkout-prefill";
export type {
	CreateShopifyCartParams,
	CreatedShopifyCart,
} from "./create-cart";
export { createShopifyCart, ShopifyCartError } from "./create-cart";
export { toCheckoutDomain } from "./checkout-url";
export {
	MAX_LINES,
	MAX_QUANTITY_PER_LINE,
	VARIANT_GID_PREFIX,
} from "./cart-limits";
