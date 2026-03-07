import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Product, ProductsResponse } from "@/lib/store-types";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
		// Get query parameters for filtering
		const searchParams = request.nextUrl.searchParams;
		const jointFilter = searchParams.get("joint");
		const categoryId = searchParams.get("category_id");
		const subcategoryId = searchParams.get("subcategory_id");
		const currency = searchParams.get("currency");
		const isBestSeller = searchParams.get("is_best_seller");
		const isFeatured = searchParams.get("is_featured");
		const isForRent = searchParams.get("is_for_rent");
		const inStockOnly = searchParams.get("in_stock");

		// Start building the query
		let query = supabase
			.from("products")
			.select(
				`
				*,
				product_images!inner (
					id,
					product_id,
					image_url,
					is_main,
					created_at,
					updated_at
				),
				product_joints!inner (
					product_joint_names!inner (
						id,
						name,
						name_ar
					)
				),
				product_reviews!left (
					id,
					product_id,
					patient_id,
					rating,
					comment,
					soft_deleted,
					created_at,
					updated_at
				),
				store_categories!left (
					id,
					name,
					name_ar,
					created_at,
					updated_at
				)
			`
			)
			.eq("soft_deleted", false)
			.eq("is_available", true);

		// Apply filters
		if (jointFilter) {
			// Note: This requires a join with product_joints and product_joint_names
			// We'll filter this in-memory after fetching
		}

		if (categoryId) {
			const categoryIdNum = parseInt(categoryId, 10);
			if (!isNaN(categoryIdNum)) {
				query = query.eq("category_id", categoryIdNum);
			}
		}

		if (subcategoryId) {
			const subcategoryIdNum = parseInt(subcategoryId, 10);
			if (!isNaN(subcategoryIdNum)) {
				query = query.eq("subcategory_id", subcategoryIdNum);
			}
		}

		if (currency) {
			query = query.eq("currency", currency);
		}

		if (isBestSeller === "true") {
			query = query.eq("is_best_seller", true);
		}

		if (isFeatured === "true") {
			query = query.eq("is_featured", true);
		}

		if (isForRent === "true") {
			query = query.eq("is_for_rent", true);
		}

		if (inStockOnly === "true") {
			query = query.gt("stock", 0).eq("is_oos", false);
		}

		// Order by featured and best sellers first, then by created date
		query = query.order("is_featured", { ascending: false });
		query = query.order("is_best_seller", { ascending: false });
		query = query.order("created_at", { ascending: false });

		const { data: rawProducts, error } = await query;

		if (error) {
			console.error("Error fetching products:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to fetch products",
				} as ProductsResponse,
				{ status: 500 }
			);
		}

		if (!rawProducts || rawProducts.length === 0) {
			return NextResponse.json({
				success: true,
				data: [],
				count: 0,
			} as ProductsResponse);
		}

		// Transform the data to match our Product type
		const products: Product[] = rawProducts.map((product: any) => {
			// Calculate average rating from non-deleted reviews
			const activeReviews = (product.product_reviews || []).filter(
				(review: any) => !review.soft_deleted
			);
			const totalRating = activeReviews.reduce(
				(sum: number, review: any) => sum + review.rating,
				0
			);
			const rating =
				activeReviews.length > 0 ? totalRating / activeReviews.length : 0;

			// Map images
			const images = (product.product_images || []).map((img: any) => ({
				id: img.id,
				product_id: img.product_id,
				image_url: img.image_url,
				is_main: img.is_main,
				created_at: img.created_at,
				updated_at: img.updated_at,
			}));

			// Map joints
			const joints = (product.product_joints || []).map((pj: any) => ({
				joint_id: pj.product_joint_names.id,
				joint_name: pj.product_joint_names.name,
				joint_name_ar: pj.product_joint_names.name_ar,
				created_at: pj.created_at || new Date().toISOString(),
				updated_at: pj.updated_at || new Date().toISOString(),
			}));

			// Map reviews (exclude soft deleted)
			const reviews = activeReviews.map((review: any) => ({
				id: review.id,
				product_id: review.product_id,
				patient_id: review.patient_id,
				rating: review.rating,
				comment: review.comment,
				soft_deleted: review.soft_deleted,
				created_at: review.created_at,
				updated_at: review.updated_at,
			}));

			// Map category (if available)
			const category = product.store_categories ? {
				id: product.store_categories.id,
				name: product.store_categories.name,
				name_ar: product.store_categories.name_ar,
				created_at: product.store_categories.created_at,
				updated_at: product.store_categories.updated_at,
			} : undefined;

			return {
				id: product.id,
				name: product.name,
				name_ar: product.name_ar,
				description: product.description,
				description_ar: product.description_ar,
				price: parseFloat(product.price),
				discounted_price: product.discounted_price
					? parseFloat(product.discounted_price)
					: null,
				currency: product.currency,
				stock: product.stock,
				is_best_seller: product.is_best_seller,
				is_featured: product.is_featured,
				is_available: product.is_available,
				is_oos: product.is_oos,
				is_for_rent: product.is_for_rent,
				rent_term: product.rent_term,
				tags: product.tags,
				category_id: product.category_id,
				subcategory_id: product.subcategory_id,
				soft_deleted: product.soft_deleted,
				created_at: product.created_at,
				updated_at: product.updated_at,
				images,
				joints,
				reviews,
				category,
				rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
				reviewCount: activeReviews.length,
			};
		});

		// Apply joint filter if specified (in-memory filtering)
		let filteredProducts = products;
		if (jointFilter) {
			filteredProducts = products.filter((product) =>
				product.joints.some((joint) => {
					// Extract just the joint name (first word) from "Knee Support" -> "knee"
					const jointName = joint.joint_name.toLowerCase().split(' ')[0];
					return jointName === jointFilter.toLowerCase();
				})
			);
		}

		return NextResponse.json({
			success: true,
			data: filteredProducts,
			count: filteredProducts.length,
		} as ProductsResponse);
	} catch (error) {
		console.error("Unexpected error in products API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred",
			} as ProductsResponse,
			{ status: 500 }
		);
	}
}
