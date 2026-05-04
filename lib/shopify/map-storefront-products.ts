import type {
	ShopifyProductCardModel,
	StorefrontProductsQueryData,
} from "./types";

function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function mapStorefrontProductsToCards(
	data: StorefrontProductsQueryData | undefined
): ShopifyProductCardModel[] {
	const edges = data?.products?.edges ?? [];
	return edges.map(({ node }) => {
		const imgEdge = node.images?.edges?.[0]?.node;
		const desc = node.description?.trim()
			? stripHtml(node.description)
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
		};
	});
}
