import type {
	ShopifyProductCardModel,
	ShopifyProductDetailModel,
	ShopifyVariantModel,
	StorefrontProductByHandleData,
	StorefrontProductCardNode,
	StorefrontProductVariantNode,
	StorefrontProductsQueryData,
} from "./types";

function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Shopify sends money as strings and reports a `compareAtPrice` even when it is
 * not a discount. A genuine sale is a compare-at price strictly greater than
 * the price being charged; anything else (missing, equal, lower, unparseable)
 * is not a sale. Cards and variants share this so they can never disagree.
 */
function resolveSale(
	priceAmount: string,
	compareAtAmount: string | null | undefined
): {
	price: number;
	compareAtPrice: number | null;
	discountPercent: number | null;
} {
	const price = Number.parseFloat(priceAmount);
	const compare =
		compareAtAmount != null ? Number.parseFloat(compareAtAmount) : Number.NaN;

	const onSale =
		Number.isFinite(price) && Number.isFinite(compare) && compare > price;

	return {
		price,
		compareAtPrice: onSale ? compare : null,
		discountPercent: onSale
			? Math.round(((compare - price) / compare) * 100)
			: null,
	};
}

export function mapStorefrontProductsToCards(
	data: StorefrontProductsQueryData | undefined
): ShopifyProductCardModel[] {
	const edges = data?.products?.edges ?? [];
	return edges.map(({ node }) => mapStorefrontProductNodeToCard(node));
}

/** Map a single raw product node (shared across listing/search/collection queries) to a card model. */
export function mapStorefrontProductNodeToCard(
	node: StorefrontProductCardNode
): ShopifyProductCardModel {
	const imgEdge = node.images?.edges?.[0]?.node;
	const desc = node.description?.trim() ? stripHtml(node.description) : null;

	const compareRaw = node.compareAtPriceRange?.minVariantPrice.amount;
	const sale = resolveSale(node.priceRange.minVariantPrice.amount, compareRaw);

	return {
		id: node.id,
		title: node.title,
		handle: node.handle,
		descriptionPlain: desc,
		tags: node.tags ?? [],
		imageUrl: imgEdge?.url ?? null,
		imageAlt: imgEdge?.altText ?? node.title,
		priceAmount: node.priceRange.minVariantPrice.amount,
		currencyCode: node.priceRange.minVariantPrice.currencyCode,
		compareAtAmount: sale.compareAtPrice != null ? (compareRaw ?? null) : null,
		availableForSale: node.availableForSale ?? true,
		discountPercent: sale.discountPercent,
	};
}

function mapVariantNode(
	node: StorefrontProductVariantNode
): ShopifyVariantModel {
	const sale = resolveSale(node.price.amount, node.compareAtPrice?.amount);

	return {
		id: node.id,
		title: node.title,
		availableForSale: node.availableForSale,
		selectedOptions: node.selectedOptions ?? [],
		price: sale.price,
		compareAtPrice: sale.compareAtPrice,
		discountPercent: sale.discountPercent,
		imageUrl: node.image?.url ?? null,
	};
}

/**
 * Map the `product(handle:)` payload into the model the product page and the
 * purchase panel render. Returns null for a missing product so callers can
 * `notFound()` without inspecting the raw shape.
 */
export function mapStorefrontProductToDetail(
	product: StorefrontProductByHandleData["product"]
): ShopifyProductDetailModel | null {
	if (!product) return null;

	return {
		id: product.id,
		title: product.title,
		handle: product.handle,
		descriptionHtml: product.descriptionHtml,
		images: (product.images?.edges ?? []).map((e) => ({
			url: e.node.url,
			altText: e.node.altText,
		})),
		options: (product.options ?? []).map((o) => ({
			name: o.name,
			values: (o.optionValues ?? []).map((v) => v.name),
		})),
		variants: (product.variants?.edges ?? []).map((e) =>
			mapVariantNode(e.node)
		),
		minPriceAmount: product.priceRange.minVariantPrice.amount,
		currencyCode: product.priceRange.minVariantPrice.currencyCode,
	};
}
