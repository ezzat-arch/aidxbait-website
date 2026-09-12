/**
 * Cart persistence. localStorage only: the cart holds Shopify variant global
 * ids, and the `user_cart` table it used to sync to keys rows on an INTEGER
 * foreign key into the Supabase catalog, which cannot hold one. Shopify owns
 * the cart from checkout onwards, so a cross-device web cart would need a
 * Shopify cart id per account, which is not worth a table for.
 */

import type { CartLine } from "@/lib/store-types";

/**
 * Version 2 of the key. Version 1 holds whole Supabase `Product` objects from
 * the catalog the store no longer renders, so it must not be read; a returning
 * buyer simply starts with an empty cart once.
 */
const CART_STORAGE_KEY = "doctoory_cart_v2";

/** A stored line is only usable if it still has the fields the UI and checkout need. */
function isCartLine(value: unknown): value is CartLine {
	if (!value || typeof value !== "object") return false;
	const line = value as Partial<CartLine>;
	return (
		typeof line.variantId === "string" &&
		line.variantId.length > 0 &&
		typeof line.title === "string" &&
		typeof line.price === "number" &&
		Number.isFinite(line.price) &&
		typeof line.quantity === "number" &&
		Number.isInteger(line.quantity) &&
		line.quantity > 0
	);
}

export function loadCartFromLocalStorage(): CartLine[] {
	if (typeof window === "undefined") return [];

	try {
		const stored = localStorage.getItem(CART_STORAGE_KEY);
		if (!stored) return [];

		const parsed: unknown = JSON.parse(stored);
		if (!Array.isArray(parsed)) return [];

		// Drop anything malformed rather than the whole cart: a single bad line
		// from an older build should not cost the buyer the rest of their basket.
		return parsed.filter(isCartLine);
	} catch (error) {
		console.error("[CartService] Failed to load from localStorage:", error);
		return [];
	}
}

export function saveCartToLocalStorage(items: CartLine[]): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	} catch (error) {
		// Private browsing and a full quota both land here. The in-memory cart is
		// still correct, so the buyer can carry on and only loses persistence.
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
