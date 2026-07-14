// lib/shopify/client.ts — Storefront API HTTP client

import { toAcceptLanguage, type ShopifyLanguageCode } from "./locale";

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
	cache = "force-cache",
	language,
}: {
	query: string;
	variables?: Record<string, unknown>;
	cache?: RequestCache;
	/**
	 * Storefront language for localized content. When set, it is injected as the
	 * `$language` GraphQL variable (consumed by `@inContext(language:)`) and sent
	 * as the `Accept-Language` header. Omit for non-localized requests.
	 */
	language?: ShopifyLanguageCode;
}): Promise<{
	status: number;
	body: ShopifyGraphQLResponse<T>;
}> {
	const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-04/graphql.json`;
	const key = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"X-Shopify-Storefront-Access-Token": key as string,
	};
	if (language) {
		headers["Accept-Language"] = toAcceptLanguage(language);
	}

	// `@inContext(language: $language)` reads this variable when present.
	const mergedVariables = language ? { ...variables, language } : variables;

	try {
		const result = await fetch(endpoint, {
			method: "POST",
			headers,
			body: JSON.stringify({ query, variables: mergedVariables }),
			cache,
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
