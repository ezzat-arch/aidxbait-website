// Order-related type definitions matching the database schema

// Constants
export const TAX_RATE = 0.14; // 14% tax
export const SHIPPING_COST = 50; // 50 EGP flat shipping fee

// Database enums
export type OrderType = "purchase" | "rental";
export type PaymentMethod = "cash_on_delivery" | "online";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
	| "pending"
	| "confirmed"
	| "shipped"
	| "delivered"
	| "cancelled";

export type AddressType = "House" | "Apartment";

// Patient Address
export interface PatientAddress {
	id: number;
	patient_id: number;
	address_type: AddressType;
	address_label: string;
	google_map_url: string | null;
	latitude: number | null;
	longitude: number | null;
	governorate: string;
	city: string;
	street: string;
	building_name: string | null;
	floor: string | null;
	apartment: string | null;
	additional_directions: string | null;
	phone: string | null;
	is_primary: boolean;
	is_deleted: boolean;
	created_at: string;
	updated_at: string;
}

// Order Item
export interface OrderItem {
	id: number;
	order_id: number;
	product_id: number;
	quantity: number;
	price_at_purchase: number;
	rental_start_date: string | null;
	rental_end_date: string | null;
	created_at: string;
	updated_at: string;
	// Optional joined product data
	product?: {
		id: number;
		name: string;
		name_ar: string;
		description: string | null;
		description_ar: string | null;
		is_for_rent: boolean;
		images?: Array<{
			id: number;
			image_url: string;
			is_main: boolean;
		}>;
	};
}

// Order
export interface Order {
	id: number;
	order_type: OrderType;
	patient_id: number;
	shipping_address_id: number | null;
	billing_address_id: number | null;
	order_date: string;
	subtotal_amount: number;
	tax_amount: number;
	discount_amount: number;
	shipping_amount: number;
	total_amount: number;
	payment_method: PaymentMethod;
	payment_status: PaymentStatus;
	order_status: OrderStatus;
	cancellation_reason: string | null;
	cancellation_date: string | null;
	cancelled_by: number | null;
	delivery_date: string | null;
	soft_deleted: boolean;
	created_at: string;
	updated_at: string;
	// Optional joined data
	order_items?: OrderItem[];
	shipping_address?: PatientAddress;
	billing_address?: PatientAddress;
}

// API Request/Response types

// Create Address Request
export interface CreateAddressRequest {
	patient_id: number;
	address_type: AddressType;
	address_label: string;
	google_map_url?: string;
	latitude?: number;
	longitude?: number;
	governorate: string;
	city: string;
	street: string;
	building_name?: string;
	floor?: string;
	apartment?: string;
	additional_directions?: string;
	phone?: string;
	is_primary?: boolean;
}

// Update Address Request
export interface UpdateAddressRequest {
	address_type?: AddressType;
	address_label?: string;
	google_map_url?: string;
	latitude?: number;
	longitude?: number;
	governorate?: string;
	city?: string;
	street?: string;
	building_name?: string;
	floor?: string;
	apartment?: string;
	additional_directions?: string;
	phone?: string;
	is_primary?: boolean;
}

// Create Order Item Request
export interface CreateOrderItemRequest {
	product_id: number;
	quantity: number;
	rental_start_date?: string; // ISO date string for rental products
	rental_end_date?: string; // ISO date string for rental products
}

// Create Order Request
export interface CreateOrderRequest {
	patient_id: number;
	items: CreateOrderItemRequest[];
	shipping_address_id: number;
	billing_address_id?: number; // Optional, defaults to shipping address
	payment_method: PaymentMethod;
	discount_amount?: number;
}

// Order Calculation
export interface OrderCalculation {
	subtotal: number;
	tax: number;
	shipping: number;
	discount: number;
	total: number;
}

// API Response types
export interface AddressResponse {
	success: boolean;
	data?: PatientAddress;
	error?: string;
}

export interface AddressesResponse {
	success: boolean;
	data?: PatientAddress[];
	error?: string;
}

export interface OrderResponse {
	success: boolean;
	data?: Order;
	error?: string;
}

export interface OrdersResponse {
	success: boolean;
	data?: Order[];
	count?: number;
	error?: string;
}

// Order filters for querying
export interface OrderFilters {
	patient_id: number;
	order_status?: OrderStatus;
	payment_status?: PaymentStatus;
	order_type?: OrderType;
	from_date?: string;
	to_date?: string;
	limit?: number;
	offset?: number;
}
