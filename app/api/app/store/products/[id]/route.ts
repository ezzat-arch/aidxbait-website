import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RouteContext {
	params: Promise<{ id: string }>;
}

/**
 * GET /api/app/store/products/[id]
 *
 * Fetch a single product with details and similar products
 */
export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;

		// 1. Fetch Product Details
		const { data: product, error } = await supabaseAdmin
			.from("products")
			.select(
				`
				*,
				store_categories (id, name),
				product_images (image_url, is_main),
				product_tags (tag),
				product_joints (joint_id, product_joint_names(id, name))
			`
			)
			.eq("id", id)
			.single();

		if (error) {
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 404 }
			);
		}

		// Process product data
		const mainImage =
			product.product_images?.find((img: any) => img.is_main)?.image_url ||
			product.product_images?.[0]?.image_url ||
			null;

		const processedProduct = {
			...product,
			image: mainImage,
			images: product.product_images?.map((img: any) => img.image_url) || [],
			tags: product.product_tags?.map((t: any) => t.tag) || [],
			joints:
				product.product_joints?.map((j: any) => j.product_joint_names) || [],
		};

		// 2. Fetch Similar Products
		// Based on category, excluding current product
		const { data: similar } = await supabaseAdmin
			.from("products")
			.select(
				`
				*,
				product_images (image_url, is_main)
			`
			)
			.eq("category_id", product.category_id)
			.neq("id", id)
			.eq("soft_deleted", false)
			.eq("is_available", true)
			.limit(5);

		const processedSimilar =
			similar?.map((p: any) => ({
				...p,
				image:
					p.product_images?.find((img: any) => img.is_main)?.image_url ||
					p.product_images?.[0]?.image_url,
			})) || [];

		return NextResponse.json({
			success: true,
			data: {
				...processedProduct,
				similar_products: processedSimilar,
			},
		});
	} catch (err: unknown) {
		const error = err as Error;
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
