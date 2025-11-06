/**
 * Store Categories Configuration
 * 
 * This file contains the category constants that match the store_categories table in the database.
 * These IDs must match the database records for proper filtering.
 */

export const STORE_CATEGORIES = {
	ALL: null, // Special case for "All Products"
	SUPPORT_BRACES_WALKING_AIDS: 1,
	MEDICAL_DEVICES: 2,
	RENTAL_EQUIPMENT: 3,
} as const;

export interface StoreCategoryConfig {
	id: number | null;
	name: string;
	name_ar: string;
	slug: string;
	description: string;
	showBodyMap: boolean;
}

export const STORE_CATEGORY_CONFIGS: StoreCategoryConfig[] = [
	{
		id: STORE_CATEGORIES.ALL,
		name: "All Products",
		name_ar: "جميع المنتجات",
		slug: "all",
		description: "Browse all available products",
		showBodyMap: false,
	},
	{
		id: STORE_CATEGORIES.SUPPORT_BRACES_WALKING_AIDS,
		name: "Support, Braces & Walking Aids",
		name_ar: "الدعامات والمشدات وأدوات المشي",
		slug: "support-braces-walking-aids",
		description: "Browse our collection of support braces and walking aids",
		showBodyMap: true,
	},
	{
		id: STORE_CATEGORIES.MEDICAL_DEVICES,
		name: "Medical Devices",
		name_ar: "الأجهزة الطبية",
		slug: "medical-devices",
		description: "Explore medical monitoring devices and equipment",
		showBodyMap: false,
	},
	{
		id: STORE_CATEGORIES.RENTAL_EQUIPMENT,
		name: "Rental of Equipment",
		name_ar: "تأجير المعدات",
		slug: "rental-equipment",
		description: "Rent medical equipment for short-term or long-term use",
		showBodyMap: false,
	},
];

/**
 * Get category configuration by ID
 */
export function getCategoryById(id: number | null): StoreCategoryConfig | undefined {
	return STORE_CATEGORY_CONFIGS.find((cat) => cat.id === id);
}

/**
 * Get category configuration by slug
 */
export function getCategoryBySlug(slug: string): StoreCategoryConfig | undefined {
	return STORE_CATEGORY_CONFIGS.find((cat) => cat.slug === slug);
}

/**
 * Check if a category should show the body map
 */
export function shouldShowBodyMap(categoryId: number | null): boolean {
	const category = getCategoryById(categoryId);
	return category?.showBodyMap ?? false;
}

