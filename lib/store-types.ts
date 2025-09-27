export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	image: string;
	images: string[];
	category: string;
	joint: Joint;
	rating: number;
	reviewCount: number;
	features: string[];
	specifications: { [key: string]: string };
	inStock: boolean;
	stockCount: number;
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface Cart {
	items: CartItem[];
	total: number;
	itemCount: number;
}

export type Joint =
	| "knee"
	| "shoulder"
	| "back"
	| "hip"
	| "ankle"
	| "wrist"
	| "elbow"
	| "neck"
	| "general";

export interface FilterOptions {
	joints: Joint[]; // Changed to array for multi-select
	priceRange: {
		min: number;
		max: number;
	};
	category: string | "all";
	inStock: boolean;
}

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
