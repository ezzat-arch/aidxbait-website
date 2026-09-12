// Database types matching the schema
export type Currency =
	"EGP" | "USD" | "EUR" | "GBP" | "AED" | "SAR" | "KWD" | "BHD" | "OMR" | "QAR";
export type RentTerm = "per_day" | "per_week" | "per_month";
export type Joint =
	| "knee"
	| "shoulder"
	| "back"
	| "hip"
	| "ankle"
	| "wrist"
	| "elbow"
	| "neck"
	| "thigh"
	| "abdomen"
	| "calf"
	| "chest"
	| "general";

// Product category from store_categories table
export interface ProductCategory {
	id: number;
	name: string;
	name_ar: string;
	created_at: string;
	updated_at: string;
}

// Store subcategory from store_subcategories table
export interface StoreSubcategory {
	id: number;
	category_id: number;
	name: string;
	name_ar: string;
	created_at: string;
	updated_at: string;
}

// Store category with subcategories from store_categories table
export interface StoreCategory {
	id: number;
	name: string;
	name_ar: string;
	created_at: string;
	updated_at: string;
	subcategories: StoreSubcategory[];
}

// Core product data from products table
export interface Product {
	id: number;
	name: string;
	name_ar: string;
	description: string | null;
	description_ar: string | null;
	price: number;
	discounted_price: number | null;
	currency: Currency;
	stock: number;
	is_best_seller: boolean;
	is_featured: boolean;
	is_available: boolean;
	is_oos: boolean;
	is_for_rent: boolean;
	rent_term: RentTerm | null;
	tags: string[] | null;
	category_id: number;
	subcategory_id: number;
	soft_deleted: boolean;
	created_at: string;
	updated_at: string;
	// Joined data
	images: ProductImage[];
	joints: ProductJoint[];
	reviews: ProductReview[];
	category?: ProductCategory;
	// Computed fields
	rating: number;
	reviewCount: number;
}

// Product image from product_images table
export interface ProductImage {
	id: number;
	product_id: number;
	image_url: string;
	is_main: boolean;
	created_at: string;
	updated_at: string;
}

// Product joint relationship
export interface ProductJoint {
	joint_id: number;
	joint_name: string;
	joint_name_ar: string;
	created_at: string;
	updated_at: string;
}

// Product review from product_reviews table
export interface ProductReview {
	id: number;
	product_id: number;
	patient_id: number;
	rating: number;
	comment: string | null;
	soft_deleted: boolean;
	created_at: string;
	updated_at: string;
	// Optional joined patient data
	patient_name?: string;
}

// Cart types
//
// The cart holds Shopify variants, not Supabase products: the catalog the store
// renders comes from the Storefront API, and checkout is Shopify's. Everything a
// line needs to render is copied onto it, so the sidebar never has to re-fetch a
// product, and a line survives in localStorage on its own.
export interface CartLine {
	/** `gid://shopify/ProductVariant/…`. The identity of a line: two lines never share one. */
	variantId: string;
	/** `gid://shopify/Product/…`, kept for analytics and "view product" links. */
	productId: string;
	/** Shopify handle, for the link back to the product page. */
	handle: string;
	title: string;
	/** e.g. `"Large / Black"`. Null for single-variant products (Shopify calls those "Default Title"). */
	variantTitle: string | null;
	imageUrl: string | null;
	/** Unit price at the time it was added. Shopify re-prices at checkout; this is for display. */
	price: number;
	quantity: number;
}

export interface Cart {
	items: CartLine[];
	total: number;
	itemCount: number;
}

// Filter options
export interface FilterOptions {
	joints: Joint[];
	priceRange: {
		min: number;
		max: number;
	};
	inStock: boolean;
	categoryId?: number | null;
	subcategoryId?: number | null;
	currency?: Currency;
	isBestSeller?: boolean;
	isFeatured?: boolean;
	isForRent?: boolean;
}

// Checkout form
export interface CheckoutFormData {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	phone: string;
}

// API Response types
export interface ProductsResponse {
	success: boolean;
	data?: Product[];
	error?: string;
	count?: number;
}

export interface CategoriesResponse {
	success: boolean;
	data?: StoreCategory[];
	error?: string;
	count?: number;
}
