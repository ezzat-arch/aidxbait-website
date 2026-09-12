// Order-related type definitions matching the database schema
//
// Website orders come from Shopify through `app/api/shopify/webhooks/orders/`;
// the mobile app writes its own. The `TAX_RATE` and `SHIPPING_COST` constants
// that used to live here went with the Supabase-catalog checkout: Shopify
// computes tax and shipping from its own settings, and a second set of numbers
// here could only ever disagree with what the buyer was charged.

// Database enums - matching Supabase schema exactly
export type OrderType = "purchase" | "rental";
export type PaymentMethod = "cash_on_delivery" | "online";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type OrderStatus =
	"pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type AddressType = "House" | "Apartment";

/** Which front end the order came from. Historic rows default to `mobile`. */
export type OrderChannel = "website" | "mobile";

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
//
// A line comes from exactly one catalog. `product_id` is set for Supabase
// catalog lines (the mobile app), the `shopify_*` columns for store lines, and
// never both. Both can be null: a deleted Shopify variant, or a line a merchant
// typed by hand, arrives with no variant id and is carried by its snapshot.
export interface OrderItem {
	id: number;
	order_id: number;
	product_id: number | null;
	/** `gid://shopify/ProductVariant/…` */
	shopify_variant_id: string | null;
	/** `gid://shopify/Product/…` */
	shopify_product_id: string | null;
	/** Shopify handle, for the link back to the product page. */
	shopify_handle: string | null;
	/**
	 * What was sold, as it was named at the time. Not denormalisation for its own
	 * sake: Shopify may rename, re-price or delete the product tomorrow and the
	 * order still has to say what the buyer bought.
	 */
	title_snapshot: string | null;
	variant_title_snapshot: string | null;
	image_url_snapshot: string | null;
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
		product_images?: Array<{
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
	/** Null for a guest order that has not been claimed by an account yet. */
	patient_id: number | null;
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
	// Paymob payment tracking (mobile app)
	paymob_order_id: string | null;
	paymob_transaction_id: string | null;
	paymob_payment_key: string | null;
	// Where the order came from, and what Shopify knows about it
	channel: OrderChannel;
	/** App locale the order was placed in, for the buyer-facing copy. */
	locale: string | null;
	/** `gid://shopify/Order/…`, unique. The idempotency key for the webhook. */
	shopify_order_id: string | null;
	/** The buyer-facing order number, e.g. `#1001`. */
	shopify_order_name: string | null;
	/** Shopify's own order status page, shown as "Track order". */
	shopify_order_status_url: string | null;
	/** The payload's `updated_at`, used to refuse a stale webhook delivery. */
	shopify_updated_at: string | null;
	/** Set only while an order placed as a guest is waiting to be claimed. */
	guest_email: string | null;
	/** The raw Shopify address of an unclaimed guest order. */
	guest_shipping_address: Record<string, unknown> | null;
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
	/** Ignored by the API, which derives the patient from the session. */
	patient_id?: number;
	order_status?: OrderStatus;
	payment_status?: PaymentStatus;
	order_type?: OrderType;
	from_date?: string;
	to_date?: string;
	limit?: number;
	offset?: number;
}
