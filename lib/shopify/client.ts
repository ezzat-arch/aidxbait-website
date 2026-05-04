// lib/shopify/client.ts — Storefront API HTTP client

export type ShopifyGraphQLError = {
	message: string;
	extensions?: Record<string, unknown>;
};

export type ShopifyGraphQLResponse<T = unknown> = {
	data?: T;
	errors?: ShopifyGraphQLError[];
};

export async function shopifyFetch<T = unknown>({
	query,
	variables = {},
}: {
	query: string;
	variables?: Record<string, unknown>;
}): Promise<{
	status: number;
	body: ShopifyGraphQLResponse<T>;
}> {
	const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-04/graphql.json`;
	const key = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

	try {
		const result = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": key as string,
			},
			body: JSON.stringify({ query, variables }),
			// Tune Next.js fetch caching as needed (e.g. no-store, revalidate).
			cache: "force-cache",
		});

		const body = (await result.json()) as ShopifyGraphQLResponse<T>;

		if (body.errors?.length) {
			console.error(body.errors);
			throw new Error("Failed to fetch data from Shopify Storefront API");
		}

		return {
			status: result.status,
			body,
		};
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
}
