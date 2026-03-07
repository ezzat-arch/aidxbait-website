// Database types matching the schema
export type Currency =
	| "EGP"
	| "USD"
	| "EUR"
	| "GBP"
	| "AED"
	| "SAR"
	| "KWD"
	| "BHD"
	| "OMR"
	| "QAR";
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
export interface CartItem {
	product: Product;
	quantity: number;
	rental_weeks?: number; // Number of weeks for rental products
	rental_start_date?: string; // ISO date string for rental products (calculated at checkout)
	rental_end_date?: string; // ISO date string for rental products (calculated at checkout)
}

export interface Cart {
	items: CartItem[];
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

// Cart sync types
export interface UserCartItem {
	id: number;
	user_id: number;
	product_id: number;
	quantity: number;
	added_at: string;
	updated_at: string;
}

export interface CartSyncRequest {
	userId: number;
	items: Array<{
		product_id: number;
		quantity: number;
		rental_weeks?: number;
	}>;
}

export interface CartSyncResponse {
	success: boolean;
	error?: string;
}
