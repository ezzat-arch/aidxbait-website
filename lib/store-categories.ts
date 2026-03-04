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

export interface StoreSubcategoryConfig {
	id: number;
	name: string;
	name_ar: string;
	slug: string;
	description?: string;
}

export interface StoreCategoryConfig {
	id: number | null;
	name: string;
	name_ar: string;
	slug: string;
	description: string;
	showBodyMap: boolean;
	subcategories?: StoreSubcategoryConfig[];
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
		subcategories: [
			{
				id: 101,
				name: "Knee Braces",
				name_ar: "دعامات الركبة",
				slug: "knee-braces",
			},
			{
				id: 102,
				name: "Ankle Supports",
				name_ar: "دعامات الكاحل",
				slug: "ankle-supports",
			},
			{
				id: 103,
				name: "Back Braces",
				name_ar: "دعامات الظهر",
				slug: "back-braces",
			},
			{
				id: 104,
				name: "Walking Aids",
				name_ar: "أدوات المشي",
				slug: "walking-aids",
			},
		],
	},
	{
		id: STORE_CATEGORIES.MEDICAL_DEVICES,
		name: "Medical Devices",
		name_ar: "الأجهزة الطبية",
		slug: "medical-devices",
		description: "Explore medical monitoring devices and equipment",
		showBodyMap: false,
		subcategories: [
			{
				id: 201,
				name: "Blood Pressure Monitors",
				name_ar: "أجهزة قياس ضغط الدم",
				slug: "blood-pressure-monitors",
			},
			{
				id: 202,
				name: "Thermometers",
				name_ar: "مقاييس الحرارة",
				slug: "thermometers",
			},
			{
				id: 203,
				name: "Pulse Oximeters",
				name_ar: "أجهزة قياس الأكسجين",
				slug: "pulse-oximeters",
			},
		],
	},
	{
		id: STORE_CATEGORIES.RENTAL_EQUIPMENT,
		name: "Rental of Equipment",
		name_ar: "تأجير المعدات",
		slug: "rental-equipment",
		description: "Rent medical equipment for short-term or long-term use",
		showBodyMap: false,
		subcategories: [
			{
				id: 301,
				name: "Wheelchairs",
				name_ar: "الكراسي المتحركة",
				slug: "wheelchairs",
			},
			{
				id: 302,
				name: "Hospital Beds",
				name_ar: "أسرة المستشفيات",
				slug: "hospital-beds",
			},
			{
				id: 303,
				name: "Mobility Scooters",
				name_ar: "سكوترات التنقل",
				slug: "mobility-scooters",
			},
		],
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

/**
 * Get subcategory by ID
 */
export function getSubcategoryById(
	categoryId: number | null,
	subcategoryId: number
): StoreSubcategoryConfig | undefined {
	const category = getCategoryById(categoryId);
	return category?.subcategories?.find((sub) => sub.id === subcategoryId);
}

