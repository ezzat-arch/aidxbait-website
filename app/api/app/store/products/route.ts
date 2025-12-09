import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/app/store/products
 *
 * Fetch products for the mobile app store with pagination and filtering
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - category_id: Filter by category
 * - joint_id: Filter by joint
 * - search: Search by name
 * - is_featured: Filter featured products
 * - is_best_seller: Filter best sellers
 * - is_for_rent: Filter rental products
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");
		const offset = (page - 1) * limit;

		const categoryId = searchParams.get("category_id");
		const jointId = searchParams.get("joint_id");
		const search = searchParams.get("search");
		const isFeatured = searchParams.get("is_featured");
		const isBestSeller = searchParams.get("is_best_seller");
		const isForRent = searchParams.get("is_for_rent");

		const select = jointId
			? `*, store_categories(id, name), product_images(image_url, is_main), product_joints!inner(joint_id)`
			: `*, store_categories(id, name), product_images(image_url, is_main)`;

		let query = supabaseAdmin
			.from("products")
			.select(select, { count: "exact" })
			.eq("soft_deleted", false)
			.eq("is_available", true);

		if (categoryId) query = query.eq("category_id", categoryId);
		if (search) query = query.ilike("name", `%${search}%`);
		if (isFeatured === "true") query = query.eq("is_featured", true);
		if (isBestSeller === "true") query = query.eq("is_best_seller", true);
		if (isForRent === "true") query = query.eq("is_for_rent", true);

		if (jointId) {
			query = query.eq("product_joints.joint_id", jointId);
		}

		query = query
			.order("is_featured", { ascending: false }) // Featured first
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		const { data, error, count } = await query;

		if (error) {
			console.error("Error fetching products:", error);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 500 }
			);
		}

		// Process data to flatten images if desired, or just return as is.
		// Frontend expects `image` (string) and `images` (array).
		const processedData = data?.map((product: any) => {
			const mainImage =
				product.product_images?.find((img: any) => img.is_main)?.image_url ||
				product.product_images?.[0]?.image_url ||
				null;

			return {
				...product,
				image: mainImage,
				images: product.product_images?.map((img: any) => img.image_url) || [],
			};
		});

		return NextResponse.json({
			success: true,
			data: processedData,
			meta: {
				page,
				limit,
				total: count,
				total_pages: count ? Math.ceil(count / limit) : 0,
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
