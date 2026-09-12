import { shopifyFetch } from "./client";
import { getVariantSnapshotsQuery } from "./queries/variants";

/** How long the webhook is willing to wait for Shopify before giving up on snapshots. */
const SNAPSHOT_TIMEOUT_MS = 2000;

export type VariantSnapshot = {
	handle: string | null;
	imageUrl: string | null;
};

type VariantSnapshotsData = {
	nodes: Array<{
		id: string;
		image: { url: string } | null;
		product: { handle: string } | null;
	} | null>;
};

/**
 * Handle and image for each variant global id, in one Storefront request.
 *
 * Best effort by design. This runs inside the order webhook, which Shopify gives
 * roughly five seconds before it counts the delivery as failed and retries, so a
 * slow or failing Storefront call must cost the order nothing: on any problem
 * this returns an empty map, the snapshot columns stay null, and the order still
 * lands with its title and price.
 *
 * A deleted variant comes back as a null node and simply has no entry.
 */
export async function getVariantSnapshots(
	variantGids: string[]
): Promise<Map<string, VariantSnapshot>> {
	const snapshots = new Map<string, VariantSnapshot>();

	// Several lines can share one variant; ask about each id once.
	const ids = Array.from(new Set(variantGids.filter(Boolean)));
	if (ids.length === 0) return snapshots;

	try {
		const { body } = await shopifyFetch<VariantSnapshotsData>({
			query: getVariantSnapshotsQuery,
			variables: { ids },
			// Order data must reflect the catalog as it is right now, not a cached page.
			revalidate: 0,
			signal: AbortSignal.timeout(SNAPSHOT_TIMEOUT_MS),
		});

		for (const node of body.data?.nodes ?? []) {
			if (!node?.id) continue;
			snapshots.set(node.id, {
				handle: node.product?.handle ?? null,
				imageUrl: node.image?.url ?? null,
			});
		}
	} catch (error) {
		console.error(
			"[Shopify Webhook] variant snapshot lookup failed, saving the order without handles or images:",
			error
		);
	}

	return snapshots;
}
