import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts, POSTS_PER_PAGE } from "@/lib/blog";
import { BlogPostsResponse } from "@/lib/blog-types";

/**
 * GET /api/blog?page=&limit=
 *
 * Paginated list of PUBLISHED blog posts with their translations (en/ar).
 * Reads through the anon Supabase client — RLS only exposes published posts.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
		const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

		const parsedLimit = Number.parseInt(
			searchParams.get("limit") || `${POSTS_PER_PAGE}`,
			10
		);
		const limit =
			Number.isNaN(parsedLimit) || parsedLimit < 1
				? POSTS_PER_PAGE
				: Math.min(parsedLimit, 50);

		const { posts, total } = await getPublishedPosts(page, limit);
		const totalPages = Math.max(1, Math.ceil(total / limit));

		return NextResponse.json({
			success: true,
			data: posts,
			count: total,
			page,
			totalPages,
		} as BlogPostsResponse);
	} catch (error) {
		console.error("Unexpected error in blog API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch blog posts",
			} as BlogPostsResponse,
			{ status: 500 }
		);
	}
}
