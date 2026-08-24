// Server-only blog data helpers. Reads go through the anon Supabase client;
// RLS already restricts every blog table to published posts, but we also
// filter on status explicitly for clarity.
import { createClient } from "@/lib/supabase/server";
import type {
	PostBySlugResult,
	PostDetail,
	PostListItem,
	PostShopifyProduct,
} from "@/lib/blog-types";
import {
	mapStorefrontProductsToCards,
	searchProductsQuery,
	shopifyFetch,
	toShopifyLanguage,
	type ShopifyProductCardModel,
	type StorefrontProductsQueryData,
} from "@/lib/shopify";

export const POSTS_PER_PAGE = 9;

export async function getPublishedPosts(
	page: number,
	perPage: number
): Promise<{ posts: PostListItem[]; total: number }> {
	const supabase = await createClient();
	const from = (page - 1) * perPage;
	const to = from + perPage - 1;

	const { data, error, count } = await supabase
		.from("posts")
		.select(
			`
			id, status, featured_image, user_id, published_at, created_at, updated_at,
			post_translations ( language, title, slug, excerpt )
		`,
			{ count: "exact" }
		)
		.eq("status", "published")
		.order("published_at", { ascending: false, nullsFirst: false })
		.order("created_at", { ascending: false })
		.range(from, to);

	if (error) {
		console.error("Failed to fetch published posts:", error);
		// Propagate so callers return a 500 / error page instead of silently
		// rendering a false "no posts" state.
		throw new Error("Failed to fetch published posts");
	}

	return { posts: (data as PostListItem[]) || [], total: count ?? 0 };
}

export async function getPostBySlug(
	slug: string
): Promise<PostBySlugResult | null> {
	const supabase = await createClient();
	const decodedSlug = decodeURIComponent(slug);

	// 1) Resolve the slug to a post (slug is unique across ALL translations)
	const { data: match, error: matchError } = await supabase
		.from("post_translations")
		.select("id, language, post_id")
		.eq("slug", decodedSlug)
		.maybeSingle();

	if (matchError) {
		console.error("Failed to resolve blog slug:", matchError);
		throw new Error("Failed to resolve blog slug");
	}
	// null = genuinely not found (404); errors above throw (500)
	if (!match) {
		return null;
	}

	// 2) Fetch the full post with translations, items and related products
	const { data: post, error } = await supabase
		.from("posts")
		.select(
			`
			*,
			post_translations ( *, post_items ( * ) ),
			post_shopify_products (
				handle, shopify_product_id, title, image_url,
				price_amount, currency_code, display_order
			)
		`
		)
		.eq("status", "published")
		.eq("id", match.post_id)
		.maybeSingle();

	if (error) {
		console.error("Failed to fetch blog post:", error);
		throw new Error("Failed to fetch blog post");
	}
	if (!post) {
		return null;
	}

	const detail = post as PostDetail;
	detail.post_shopify_products = (detail.post_shopify_products || []).sort(
		(a, b) => a.display_order - b.display_order
	);
	for (const translation of detail.post_translations) {
		translation.post_items = (translation.post_items || []).sort(
			(a, b) => a.display_order - b.display_order
		);
	}

	return { post: detail, matchedLanguage: match.language };
}

// Turn a post's post_shopify_products rows into store cards. Fetches LIVE
// Shopify data by handle (localized title/price/availability); when Shopify
// is unreachable or misconfigured, falls back to the dashboard snapshots so
// the section still renders. Products deleted from Shopify are omitted.
export async function getRelatedShopifyProductCards(
	rows: PostShopifyProduct[],
	locale: string
): Promise<ShopifyProductCardModel[]> {
	if (rows.length === 0) return [];

	try {
		const res = await shopifyFetch<StorefrontProductsQueryData>({
			query: searchProductsQuery,
			variables: {
				query: rows.map((row) => `handle:${row.handle}`).join(" OR "),
			},
			language: toShopifyLanguage(locale),
		});
		const cards = mapStorefrontProductsToCards(res.body.data);
		// Preserve the admin's display order and drop any stray search hits.
		const orderByHandle = new Map(rows.map((row, index) => [row.handle, index]));
		return cards
			.filter((card) => orderByHandle.has(card.handle))
			.sort(
				(a, b) =>
					(orderByHandle.get(a.handle) ?? 0) - (orderByHandle.get(b.handle) ?? 0)
			);
	} catch (error) {
		console.error("Failed to fetch related products from Shopify:", error);
		return rows.map((row) => ({
			id: row.shopify_product_id ?? row.handle,
			title: row.title,
			handle: row.handle,
			descriptionPlain: null,
			tags: [],
			imageUrl: row.image_url,
			imageAlt: row.title,
			priceAmount: row.price_amount ?? "0",
			currencyCode: row.currency_code ?? "EGP",
			compareAtAmount: null,
			availableForSale: true,
			discountPercent: null,
		}));
	}
}
