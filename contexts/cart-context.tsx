"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	type ReactNode,
} from "react";
import type { Cart, CartLine } from "@/lib/store-types";
import {
	cartReducer,
	initialCartState,
	type CartAction,
	type CartState,
} from "@/lib/cart/cart-reducer";
import {
	loadCartFromLocalStorage,
	saveCartToLocalStorage,
} from "@/lib/cart/cart-service";
import { eventService } from "@/lib/tracking/event-service";

interface CartContextType {
	cart: Cart;
	/** Add a line, or raise the quantity of the variant if it is already in the cart. */
	addLine: (line: CartLine) => void;
	removeLine: (variantId: string) => void;
	/** A quantity below 1 removes the line. */
	setQuantity: (variantId: string, quantity: number) => void;
	clearCart: () => void;
	isCartOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(cartReducer, initialCartState);

	// Mirrors `state` so an action's *resulting* cart value can be reported to
	// tracking in the same tick. Reading `state` there would report the value
	// from before the action, which is what the previous implementation did.
	const stateRef = useRef<CartState>(state);
	stateRef.current = state;

	/** Dispatch, then hand the resulting state to the caller for its tracking call. */
	const apply = useCallback(
		(action: CartAction, track?: (next: CartState) => void) => {
			const next = cartReducer(stateRef.current, action);
			stateRef.current = next;
			dispatch(action);
			track?.(next);
		},
		[]
	);

	// Hydrate from localStorage in an effect, never in a `useReducer` initializer:
	// the navbar badge is server-rendered, so a client-only initial state would be
	// a hydration mismatch. `SET_CART` also flips `hydrated`, which unblocks saving.
	useEffect(() => {
		dispatch({ type: "SET_CART", items: loadCartFromLocalStorage() });
	}, []);

	// Persist every change, but only once hydration has landed — otherwise the
	// first commit would write an empty cart over the stored one.
	useEffect(() => {
		if (!state.hydrated) return;
		saveCartToLocalStorage(state.cart.items);
	}, [state.cart.items, state.hydrated]);

	const value = useMemo<CartContextType>(() => {
		// Shopify ids are strings, and `cart_events.product_id` is an integer
		// foreign key into the Supabase catalog, so the id is left out. The cart
		// value and item count, which is what the funnel reports read, still land.
		const trackCart = (
			eventType:
				"add" | "remove" | "update_quantity" | "clear" | "open" | "close",
			next: CartState,
			extra?: { quantity?: number; previousQuantity?: number }
		) =>
			eventService.trackCartEvent(eventType, {
				productId: undefined,
				cartValue: next.cart.total,
				cartItemCount: next.cart.itemCount,
				...extra,
			});

		return {
			cart: state.cart,
			isCartOpen: state.isCartOpen,

			addLine: (line) =>
				apply({ type: "ADD_LINE", line }, (next) =>
					trackCart("add", next, { quantity: line.quantity })
				),

			removeLine: (variantId) => {
				const previousQuantity =
					stateRef.current.cart.items.find((l) => l.variantId === variantId)
						?.quantity ?? 0;
				apply({ type: "REMOVE_LINE", variantId }, (next) =>
					trackCart("remove", next, { quantity: previousQuantity })
				);
			},

			setQuantity: (variantId, quantity) => {
				const previousQuantity =
					stateRef.current.cart.items.find((l) => l.variantId === variantId)
						?.quantity ?? 0;
				apply({ type: "SET_QUANTITY", variantId, quantity }, (next) =>
					trackCart("update_quantity", next, { quantity, previousQuantity })
				);
			},

			// Synchronous: there is no longer a server copy to clear. The event
			// reports the cart as it stood *before* the clear, since what a "clear"
			// is worth to the funnel is what the buyer walked away from.
			clearCart: () => {
				const abandoned = stateRef.current;
				apply({ type: "CLEAR" }, () => trackCart("clear", abandoned));
			},

			openCart: () =>
				apply({ type: "OPEN_CART" }, (next) => trackCart("open", next)),
			closeCart: () =>
				apply({ type: "CLOSE_CART" }, (next) => trackCart("close", next)),
			toggleCart: () =>
				apply({ type: "TOGGLE_CART" }, (next) =>
					trackCart(next.isCartOpen ? "open" : "close", next)
				),
		};
	}, [state.cart, state.isCartOpen, apply]);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
