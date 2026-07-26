// Database types matching the blog module schema (migrations
// 009_blog_module.sql + 010_blog_shopify_products.sql)
export type PostStatus = "draft" | "published" | "archived";
export type PostLanguage = "en" | "ar";

// Core post data from posts table
export interface Post {
	id: number;
	status: PostStatus;
	featured_image: string | null;
	user_id: number;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

// Content block from post_items table (ordered by display_order)
export interface PostItem {
	id: number;
	post_translation_id: number;
	body: string;
	image: string | null;
	video: string | null;
	link: string | null;
	display_order: number;
	created_at: string;
	updated_at: string;
}

// Per-language row from post_translations table
export interface PostTranslation {
	id: number;
	post_id: number;
	language: PostLanguage;
	title: string;
	slug: string;
	content: string;
	excerpt: string | null;
	meta_title: string | null;
	meta_description: string | null;
	created_at: string;
	updated_at: string;
	// Joined data
	post_items: PostItem[];
}

// Slim translation shape used on the blog listing page
export interface PostListTranslation {
	language: PostLanguage;
	title: string;
	slug: string;
	excerpt: string | null;
}

// Listing row: post + slim translations
export interface PostListItem extends Post {
	post_translations: PostListTranslation[];
}

// Related Shopify product row from post_shopify_products: a display snapshot
// (title/image/price) captured in the dashboard; the website prefers live
// Shopify data fetched by handle and falls back to this snapshot.
export interface PostShopifyProduct {
	handle: string;
	shopify_product_id: string | null;
	title: string;
	image_url: string | null;
	price_amount: string | null;
	currency_code: string | null;
	display_order: number;
}

// Full post detail: post + full translations (with items) + related products
export interface PostDetail extends Post {
	post_translations: PostTranslation[];
	post_shopify_products: PostShopifyProduct[];
}

// Result of looking a post up by slug
export interface PostBySlugResult {
	post: PostDetail;
	matchedLanguage: PostLanguage;
}

// GET /api/blog response envelope (matches the store API conventions)
export interface BlogPostsResponse {
	success: boolean;
	data?: PostListItem[];
	count?: number;
	page?: number;
	totalPages?: number;
	error?: string;
}

// GET /api/blog/[slug] response envelope
export interface BlogPostResponse {
	success: boolean;
	data?: PostBySlugResult;
	error?: string;
}
