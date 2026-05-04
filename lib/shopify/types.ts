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
