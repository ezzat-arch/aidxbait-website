import type {
	ShopifyProductCardModel,
	StorefrontProductCardNode,
	StorefrontProductsQueryData,
} from "./types";

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

	const price = Number.parseFloat(node.priceRange.minVariantPrice.amount);
	const compareRaw = node.compareAtPriceRange?.minVariantPrice.amount;
	const compare = compareRaw != null ? Number.parseFloat(compareRaw) : NaN;

	// A genuine sale is a compare-at price strictly greater than the current price.
	const onSale =
		Number.isFinite(price) && Number.isFinite(compare) && compare > price;
	const discountPercent = onSale
		? Math.round(((compare - price) / compare) * 100)
		: null;

	return {
		id: node.id,
		title: node.title,
		handle: node.handle,
		descriptionPlain: desc,
		imageUrl: imgEdge?.url ?? null,
		imageAlt: imgEdge?.altText ?? node.title,
		priceAmount: node.priceRange.minVariantPrice.amount,
		currencyCode: node.priceRange.minVariantPrice.currencyCode,
		compareAtAmount: onSale ? compareRaw ?? null : null,
		availableForSale: node.availableForSale ?? true,
		discountPercent,
	};
}
