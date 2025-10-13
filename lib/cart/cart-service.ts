import { CartItem } from "@/lib/store-types";
import { withRetry } from "./retry-utils";

const CART_STORAGE_KEY = "aidxbait_cart";

export function loadCartFromLocalStorage(): CartItem[] {
	if (typeof window === "undefined") return [];

	try {
		const stored = localStorage.getItem(CART_STORAGE_KEY);
		if (!stored) return [];

		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.error("[CartService] Failed to load from localStorage:", error);
		return [];
	}
}

export function saveCartToLocalStorage(items: CartItem[]): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	} catch (error) {
		console.error("[CartService] Failed to save to localStorage:", error);
	}
}

export function clearLocalStorageCart(): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.removeItem(CART_STORAGE_KEY);
	} catch (error) {
		console.error("[CartService] Failed to clear localStorage:", error);
	}
}

export async function syncCartToServer(
	userId: number,
	items: CartItem[]
): Promise<void> {
	await withRetry(async () => {
		const response = await fetch("/api/cart/sync", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId,
				items: items.map((item) => ({
					product_id: item.product.id,
					quantity: item.quantity,
				})),
			}),
		});

		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Unknown error" }));
			throw new Error(error.error || "Failed to sync cart");
		}

		return await response.json();
	});
}

export async function fetchCartFromServer(userId: number): Promise<CartItem[]> {
	return await withRetry(async () => {
		const response = await fetch(`/api/cart?userId=${userId}`);

		if (!response.ok) {
			throw new Error("Failed to fetch cart from server");
		}

		const data = await response.json();
		return data.items || [];
	});
}

export async function updateCartItemOnServer(
	userId: number,
	productId: number,
	quantity: number
): Promise<void> {
	await withRetry(async () => {
		const response = await fetch(`/api/cart/${productId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId, quantity }),
		});

		if (!response.ok) {
			throw new Error("Failed to update cart item");
		}
	});
}

export async function removeCartItemFromServer(
	userId: number,
	productId: number
): Promise<void> {
	await withRetry(async () => {
		const response = await fetch(`/api/cart/${productId}`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId }),
		});

		if (!response.ok) {
			throw new Error("Failed to remove cart item");
		}
	});
}
