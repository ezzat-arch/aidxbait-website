import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Product, ProductsResponse } from "@/lib/store-types";

interface RouteContext {
	params: {
		id: string;
	};
}

export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const supabase = await createClient();
		const params = await context.params;
		const productId = parseInt(params.id);

		if (isNaN(productId)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid product ID",
				} as ProductsResponse,
				{ status: 400 }
			);
		}

		// Fetch the specific product with all related data
		const { data: rawProducts, error } = await supabase
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
				)
			`
			)
			.eq("id", productId)
			.eq("soft_deleted", false)
			.eq("is_available", true);

		if (error) {
			console.error("Error fetching product:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to fetch product",
				} as ProductsResponse,
				{ status: 500 }
			);
		}

		if (!rawProducts || rawProducts.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Product not found",
				} as ProductsResponse,
				{ status: 404 }
			);
		}

		const rawProduct = rawProducts[0];

		// Calculate average rating from non-deleted reviews
		const activeReviews = (rawProduct.product_reviews || []).filter(
			(review: any) => !review.soft_deleted
		);
		const totalRating = activeReviews.reduce(
			(sum: number, review: any) => sum + review.rating,
			0
		);
		const rating =
			activeReviews.length > 0 ? totalRating / activeReviews.length : 0;

		// Map images
		const images = (rawProduct.product_images || []).map((img: any) => ({
			id: img.id,
			product_id: img.product_id,
			image_url: img.image_url,
			is_main: img.is_main,
			created_at: img.created_at,
			updated_at: img.updated_at,
		}));

		// Map joints
		const joints = (rawProduct.product_joints || []).map((pj: any) => ({
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

		const product: Product = {
			id: rawProduct.id,
			name: rawProduct.name,
			name_ar: rawProduct.name_ar,
			description: rawProduct.description,
			description_ar: rawProduct.description_ar,
			price: parseFloat(rawProduct.price),
			discounted_price: rawProduct.discounted_price
				? parseFloat(rawProduct.discounted_price)
				: null,
			currency: rawProduct.currency,
			stock: rawProduct.stock,
			is_best_seller: rawProduct.is_best_seller,
			is_featured: rawProduct.is_featured,
			is_available: rawProduct.is_available,
			is_oos: rawProduct.is_oos,
			is_for_rent: rawProduct.is_for_rent,
			rent_term: rawProduct.rent_term,
			tags: rawProduct.tags,
			category_id: rawProduct.category_id,
			subcategory_id: rawProduct.subcategory_id,
			soft_deleted: rawProduct.soft_deleted,
			created_at: rawProduct.created_at,
			updated_at: rawProduct.updated_at,
			images,
			joints,
			reviews,
			rating: Math.round(rating * 10) / 10,
			reviewCount: activeReviews.length,
		};

		return NextResponse.json({
			success: true,
			data: [product],
			count: 1,
		} as ProductsResponse);
	} catch (error) {
		console.error("Unexpected error in product API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred",
			} as ProductsResponse,
			{ status: 500 }
		);
	}
}
