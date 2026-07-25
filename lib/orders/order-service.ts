import type {
	Order,
	CreateOrderRequest,
	OrderFilters,
	OrderResponse,
	OrdersResponse,
	OrderCalculation,
} from "@/lib/order-types";
import { TAX_RATE, SHIPPING_COST } from "@/lib/order-types";
import { DEFAULT_CURRENCY } from "@/lib/i18n/utils";

/**
 * Calculate order totals
 */
export function calculateOrderTotals(
	subtotal: number,
	discountAmount: number = 0
): OrderCalculation {
	const tax = subtotal * TAX_RATE;
	const shipping = SHIPPING_COST;
	const total = subtotal + tax + shipping - discountAmount;

	return {
		subtotal,
		tax,
		shipping,
		discount: discountAmount,
		total,
	};
}

/**
 * Create a new order
 */
export async function createOrder(
	orderData: CreateOrderRequest
): Promise<Order> {
	try {
		const response = await fetch("/api/orders", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(orderData),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Failed to create order" }));

			console.error("[OrderService] API request failed:", {
				status: response.status,
				statusText: response.statusText,
				payload: {
					patient_id: orderData.patient_id,
					items_count: orderData.items.length,
					shipping_address_id: orderData.shipping_address_id,
					billing_address_id: orderData.billing_address_id,
					payment_method: orderData.payment_method,
				},
				error: errorData,
			});

			throw new Error(errorData.error || "Failed to create order");
		}

		const data: OrderResponse = await response.json();

		if (!data.success || !data.data) {
			console.error("[OrderService] Invalid response from API:", {
				success: data.success,
				hasData: !!data.data,
				error: data.error,
				payload: {
					patient_id: orderData.patient_id,
					items_count: orderData.items.length,
				},
			});
			throw new Error(data.error || "Failed to create order");
		}

		return data.data;
	} catch (error) {
		console.error("[OrderService] Error creating order:", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : undefined,
			payload: {
				patient_id: orderData.patient_id,
				items_count: orderData.items.length,
				shipping_address_id: orderData.shipping_address_id,
			},
		});
		throw error;
	}
}

/**
 * Fetch all orders for a patient with optional filters
 */
export async function fetchOrders(
	filters: OrderFilters
): Promise<{ orders: Order[]; count: number }> {
	try {
		// Build query string
		const params = new URLSearchParams();
		params.append("patient_id", filters.patient_id.toString());

		if (filters.order_status) {
			params.append("order_status", filters.order_status);
		}
		if (filters.payment_status) {
			params.append("payment_status", filters.payment_status);
		}
		if (filters.order_type) {
			params.append("order_type", filters.order_type);
		}
		if (filters.from_date) {
			params.append("from_date", filters.from_date);
		}
		if (filters.to_date) {
			params.append("to_date", filters.to_date);
		}
		if (filters.limit) {
			params.append("limit", filters.limit.toString());
		}
		if (filters.offset) {
			params.append("offset", filters.offset.toString());
		}

		const response = await fetch(`/api/orders?${params.toString()}`);

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Failed to fetch orders" }));
			throw new Error(error.error || "Failed to fetch orders");
		}

		const data: OrdersResponse = await response.json();

		if (!data.success || !data.data) {
			throw new Error(data.error || "Failed to fetch orders");
		}

		return {
			orders: data.data,
			count: data.count || 0,
		};
	} catch (error) {
		console.error("[OrderService] Error fetching orders:", error);
		throw error;
	}
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderDetails(
	orderId: number,
	patientId?: number
): Promise<Order> {
	try {
		const params = new URLSearchParams();
		if (patientId) {
			params.append("patient_id", patientId.toString());
		}

		const url = `/api/orders/${orderId}${
			params.toString() ? `?${params.toString()}` : ""
		}`;
		const response = await fetch(url);

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Failed to fetch order" }));
			throw new Error(error.error || "Failed to fetch order");
		}

		const data: OrderResponse = await response.json();

		if (!data.success || !data.data) {
			throw new Error(data.error || "Failed to fetch order");
		}

		return data.data;
	} catch (error) {
		console.error("[OrderService] Error fetching order details:", error);
		throw error;
	}
}

/**
 * Get order status display text
 */
export function getOrderStatusText(status: string): string {
	const statusMap: Record<string, string> = {
		pending: "Pending",
		confirmed: "Confirmed",
		shipped: "Shipped",
		delivered: "Delivered",
		cancelled: "Cancelled",
	};
	return statusMap[status] || status;
}

/**
 * Get payment status display text
 */
export function getPaymentStatusText(status: string): string {
	const statusMap: Record<string, string> = {
		pending: "Pending",
		paid: "Paid",
		failed: "Failed",
	};
	return statusMap[status] || status;
}

/**
 * Get order type display text
 */
export function getOrderTypeText(type: string): string {
	const typeMap: Record<string, string> = {
		purchase: "Purchase",
		rental: "Rental",
	};
	return typeMap[type] || type;
}

/**
 * Format currency amount
 */
export function formatCurrency(
	amount: number,
	currency: string = DEFAULT_CURRENCY
): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
	}).format(amount);
}
