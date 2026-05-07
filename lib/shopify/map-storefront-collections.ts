import type {
	ShopifyCollectionCardModel,
	StorefrontCollectionsQueryData,
} from "./types";

export function mapStorefrontCollectionsToCards(
	data: StorefrontCollectionsQueryData | undefined
): ShopifyCollectionCardModel[] {
	const edges = data?.collections?.edges ?? [];
	return edges.map(({ node }) => ({
		id: node.id,
		title: node.title,
		handle: node.handle,
		description: node.description?.trim() || null,
		imageUrl: node.image?.url ?? null,
		imageAlt: node.image?.altText ?? node.title,
	}));
}
