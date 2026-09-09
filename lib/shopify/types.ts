import type { ShopifyStoreCountryCode } from "./locale";

/** Storefront API shapes used by product listing queries */

export type StorefrontProductsQueryData = {
	products: {
		edges: Array<{
			node: StorefrontProductCardNode;
		}>;
	};
};

/** Raw GraphQL node shared by product listing / search / collection queries */
export type StorefrontProductCardNode = {
	id: string;
	title: string;
	handle: string;
	description: string;
	tags: string[];
	availableForSale: boolean;
	images: {
		edges: Array<{
			node: { url: string; altText: string | null };
		}>;
	};
	priceRange: {
		minVariantPrice: { amount: string; currencyCode: string };
	};
	compareAtPriceRange?: {
		minVariantPrice: { amount: string; currencyCode: string };
	};
};

/** Minimal product fields for storefront cards (mapped from GraphQL) */
export type ShopifyProductCardModel = {
	id: string;
	title: string;
	handle: string;
	descriptionPlain: string | null;
	/** Shopify product tags, used for tag-scoped search matching */
	tags: string[];
	imageUrl: string | null;
	imageAlt: string | null;
	priceAmount: string;
	currencyCode: string;
	/** Original ("was") price when the product is on sale; null otherwise */
	compareAtAmount: string | null;
	/** Whether the product can currently be purchased */
	availableForSale: boolean;
	/** Rounded discount percentage (e.g. 20 for 20% off), or null when not on sale */
	discountPercent: number | null;
};

/** Storefront API shapes used by collection listing queries */
export type StorefrontCollectionsQueryData = {
	collections: {
		edges: Array<{
			node: {
				id: string;
				title: string;
				handle: string;
				description: string;
				image: { url: string; altText: string | null } | null;
			};
		}>;
	};
};

/** Minimal collection fields for storefront cards (mapped from GraphQL) */
export type ShopifyCollectionCardModel = {
	id: string;
	title: string;
	handle: string;
	description: string | null;
	imageUrl: string | null;
	imageAlt: string | null;
};

/** `collection(handle:)` query payload */
export type StorefrontCollectionByHandleData = {
	collection: {
		id: string;
		title: string;
		handle: string;
		description: string;
		image: { url: string; altText: string | null } | null;
		products: {
			edges: Array<{
				node: StorefrontProductCardNode;
			}>;
		};
	} | null;
};

/** One `ProductVariant` node as returned by `getProductByHandleQuery`. */
export type StorefrontProductVariantNode = {
	id: string;
	title: string;
	availableForSale: boolean;
	selectedOptions: Array<{ name: string; value: string }>;
	price: { amount: string; currencyCode: string };
	compareAtPrice: { amount: string; currencyCode: string } | null;
	image: { url: string; altText: string | null } | null;
};

/** `product(handle:)` query payload */
export type StorefrontProductByHandleData = {
	product: {
		id: string;
		title: string;
		handle: string;
		descriptionHtml: string;
		images: {
			edges: Array<{
				node: { url: string; altText: string | null };
			}>;
		};
		priceRange: {
			minVariantPrice: { amount: string; currencyCode: string };
		};
		options: Array<{
			name: string;
			/** `values` is deprecated on current API versions; `optionValues` replaces it. */
			optionValues: Array<{ name: string }>;
		}>;
		variants: {
			edges: Array<{ node: StorefrontProductVariantNode }>;
		};
	} | null;
};

/** One purchasable variant, mapped for the product page and the cart. */
export type ShopifyVariantModel = {
	/** `gid://shopify/ProductVariant/…` — this is what a cart line is keyed on. */
	id: string;
	/** Shopify's own label, e.g. `"Large / Black"`, or `"Default Title"` for single-variant products. */
	title: string;
	availableForSale: boolean;
	/** One entry per product option, in the product's option order. */
	selectedOptions: Array<{ name: string; value: string }>;
	price: number;
	/** Original ("was") price when this variant is on sale; null otherwise. */
	compareAtPrice: number | null;
	discountPercent: number | null;
	imageUrl: string | null;
};

/** A product page's full model: everything the purchase panel needs. */
export type ShopifyProductDetailModel = {
	id: string;
	title: string;
	handle: string;
	descriptionHtml: string;
	images: Array<{ url: string; altText: string | null }>;
	/** Option names with their selectable values, in Shopify's display order. */
	options: Array<{ name: string; values: string[] }>;
	variants: ShopifyVariantModel[];
	/** Lowest variant price, used for structured data and the fallback price label. */
	minPriceAmount: string;
	currencyCode: string;
};

/* -------------------------------------------------------------------------- */
/*  Cart and hosted checkout (`cartCreate`)                                   */
/* -------------------------------------------------------------------------- */

/** One line of a `cartCreate` input (Storefront `CartLineInput`, the subset we send). */
export type StorefrontCartLineInput = {
	/** `gid://shopify/ProductVariant/…` */
	merchandiseId: string;
	quantity: number;
};

/**
 * Storefront `CartBuyerIdentityInput`, the subset we send. `countryCode` is
 * always present so checkout prices in the store's market; `email` and `phone`
 * (E.164) pre-fill the contact step for a signed-in buyer.
 */
export type StorefrontCartBuyerIdentityInput = {
	countryCode: ShopifyStoreCountryCode;
	email?: string;
	phone?: string;
};

/** Storefront `CartDeliveryAddressInput`, the subset we send. */
export type StorefrontCartDeliveryAddressInput = {
	countryCode: ShopifyStoreCountryCode;
	firstName?: string;
	lastName?: string;
	address1?: string;
	address2?: string;
	city?: string;
	/** ISO 3166-2 region code (for Egypt, a governorate code). Omitted when unknown. */
	provinceCode?: string;
	/** E.164, e.g. `+201001234567`. */
	phone?: string;
};

/** Storefront `CartSelectableAddressInput`. */
export type StorefrontCartSelectableAddressInput = {
	address: { deliveryAddress: StorefrontCartDeliveryAddressInput };
	/** Pre-selects this address at checkout. */
	selected: boolean;
	/**
	 * `COUNTRY_CODE_ONLY` accepts the address as long as the country is valid;
	 * `STRICT` rejects the whole mutation on any field Shopify cannot validate.
	 * Egyptian addresses have no postal code and free-text governorates, so
	 * strict validation would refuse most of them.
	 */
	validationStrategy: "COUNTRY_CODE_ONLY" | "STRICT";
};

/** Storefront `CartInput`, the subset `cartCreate` receives from us. */
export type StorefrontCartInput = {
	lines: StorefrontCartLineInput[];
	buyerIdentity?: StorefrontCartBuyerIdentityInput;
	delivery?: { addresses: StorefrontCartSelectableAddressInput[] };
	/** Custom key/values that land on the order as `note_attributes`. */
	attributes?: Array<{ key: string; value: string }>;
};

/** The buyer/delivery part of a `CartInput`, kept apart so it can be dropped on retry. */
export type StorefrontCartPrefillInput = Pick<
	StorefrontCartInput,
	"buyerIdentity" | "delivery" | "attributes"
>;

/** `cartCreate` mutation payload */
export type StorefrontCartCreateData = {
	cartCreate: {
		cart: { id: string; checkoutUrl: string } | null;
		userErrors: Array<{
			/** Path into the input, e.g. `["input", "lines", "0", "merchandiseId"]`. */
			field: string[] | null;
			message: string;
			code: string | null;
		}>;
		warnings: Array<{ code: string; message: string; target: string | null }>;
	};
};
