import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { StoreCategory, CategoriesResponse } from "@/lib/store-types";

interface RouteContext {
	params: {
		id: string;
	};
}

export async function GET(request: NextRequest, context: RouteContext) {
	try {
		const supabase = await createClient();
		const params = await context.params;
		const categoryId = parseInt(params.id);

		if (isNaN(categoryId)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid category ID",
				} as CategoriesResponse,
				{ status: 400 }
			);
		}

		// Fetch the specific category with its subcategories
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
			.eq("id", categoryId);

		if (error) {
			console.error("Error fetching category:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to fetch category",
				} as CategoriesResponse,
				{ status: 500 }
			);
		}

		if (!rawCategories || rawCategories.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Category not found",
				} as CategoriesResponse,
				{ status: 404 }
			);
		}

		const rawCategory = rawCategories[0];

		// Map subcategories
		const subcategories = (rawCategory.store_subcategories || []).map(
			(subcat: any) => ({
				id: subcat.id,
				category_id: subcat.category_id,
				name: subcat.name,
				name_ar: subcat.name_ar,
				created_at: subcat.created_at,
				updated_at: subcat.updated_at,
			})
		);

		const category: StoreCategory = {
			id: rawCategory.id,
			name: rawCategory.name,
			name_ar: rawCategory.name_ar,
			created_at: rawCategory.created_at,
			updated_at: rawCategory.updated_at,
			subcategories,
		};

		return NextResponse.json({
			success: true,
			data: [category],
			count: 1,
		} as CategoriesResponse);
	} catch (error) {
		console.error("Unexpected error in category API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "An unexpected error occurred",
			} as CategoriesResponse,
			{ status: 500 }
		);
	}
}

