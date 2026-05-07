/** Storefront API shapes used by product listing queries */

export type StorefrontProductsQueryData = {
	products: {
		edges: Array<{
			node: {
				id: string;
				title: string;
				handle: string;
				description: string;
				images: {
					edges: Array<{
						node: { url: string; altText: string | null };
					}>;
				};
				priceRange: {
					minVariantPrice: { amount: string; currencyCode: string };
				};
			};
		}>;
	};
};

/** Minimal product fields for storefront cards (mapped from GraphQL) */
export type ShopifyProductCardModel = {
	id: string;
	title: string;
	handle: string;
	descriptionPlain: string | null;
	imageUrl: string | null;
	imageAlt: string | null;
	priceAmount: string;
	currencyCode: string;
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
				node: {
					id: string;
					title: string;
					handle: string;
					description: string;
					images: {
						edges: Array<{
							node: { url: string; altText: string | null };
						}>;
					};
					priceRange: {
						minVariantPrice: { amount: string; currencyCode: string };
					};
				};
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
