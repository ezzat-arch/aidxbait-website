import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { StoreCategory, CategoriesResponse } from "@/lib/store-types";

/**
 * GET /api/app/store/category
 *
 * Fetch all store categories with subcategories for the app.
 */
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();

		// Fetch all categories with their subcategories
		const { data: rawCategories, error } = await supabase
			.from("store_categories")
			.select(
				`
				*,
				store_subcategories (
					id,
					category_id,
					name,
					name_ar,
					created_at,
					updated_at
				)
			`
			)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching categories:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to fetch categories",
				} as CategoriesResponse,
				{ status: 500 }
			);
		}

		if (!rawCategories || rawCategories.length === 0) {
			return NextResponse.json({
				success: true,
				data: [],
				count: 0,
			} as CategoriesResponse);
		}

		// Transform the data to match our StoreCategory type
		const categories: StoreCategory[] = rawCategories.map((category: any) => {
			// Map subcategories
			const subcategories = (category.store_subcategories || []).map(
				(subcat: any) => ({
					id: subcat.id,
					category_id: subcat.category_id,
					name: subcat.name,
					name_ar: subcat.name_ar,
					created_at: subcat.created_at,
					updated_at: subcat.updated_at,
				})
			);

			return {
				id: category.id,
				name: category.name,
				name_ar: category.name_ar,
				created_at: category.created_at,
				updated_at: category.updated_at,
				subcategories,
			};
		});

		return NextResponse.json({
			success: true,
			data: categories,
			count: categories.length,
		} as CategoriesResponse);
	} catch (error) {
		console.error("Unexpected error in app store category API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred",
			} as CategoriesResponse,
			{ status: 500 }
		);
	}
}
