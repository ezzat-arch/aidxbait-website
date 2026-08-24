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

/** `product(handle:)` query payload */
export type StorefrontProductByHandleData = {
	product: {
		id: string;
		title: string;
		descriptionHtml: string;
		images: {
			edges: Array<{
				node: { url: string; altText: string | null };
			}>;
		};
		priceRange: {
			minVariantPrice: { amount: string; currencyCode: string };
		};
		variants: {
			edges: Array<{
				node: { id: string; availableForSale: boolean };
			}>;
		};
	} | null;
};
