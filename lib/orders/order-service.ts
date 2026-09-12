import type {
	Order,
	OrderFilters,
	OrderResponse,
	OrdersResponse,
} from "@/lib/order-types";
import { DEFAULT_CURRENCY } from "@/lib/i18n/utils";

/**
 * Fetch all orders for a patient with optional filters
 */
export async function fetchOrders(
	filters: OrderFilters
): Promise<{ orders: Order[]; count: number }> {
	try {
		// No `patient_id`: the API derives the patient from the session cookie and
		// ignores anything the client sends.
		const params = new URLSearchParams();

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
export async function fetchOrderDetails(orderId: number): Promise<Order> {
	try {
		// The API answers 404 for an order that is not the caller's own, so no
		// patient id is sent and none would be trusted if it were.
		const response = await fetch(`/api/orders/${orderId}`);

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
