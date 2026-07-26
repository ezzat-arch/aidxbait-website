import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog";
import { BlogPostResponse } from "@/lib/blog-types";

interface RouteContext {
	params: Promise<{
		slug: string;
	}>;
}

/**
 * GET /api/blog/[slug]
 *
 * Full detail of one PUBLISHED blog post, resolved by any of its translation
 * slugs: translations with their ordered content blocks (body + optional
 * image/video/link) and the purchasable related products. `matchedLanguage`
 * tells the client which language the requested slug belongs to.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
	try {
		const { slug } = await context.params;

		if (!slug || !slug.trim()) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid post slug",
				} as BlogPostResponse,
				{ status: 400 }
			);
		}

		const result = await getPostBySlug(slug);

		if (!result) {
			return NextResponse.json(
				{
					success: false,
					error: "Post not found",
				} as BlogPostResponse,
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: result,
		} as BlogPostResponse);
	} catch (error) {
		console.error("Unexpected error in blog post API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch blog post",
			} as BlogPostResponse,
			{ status: 500 }
		);
	}
}
