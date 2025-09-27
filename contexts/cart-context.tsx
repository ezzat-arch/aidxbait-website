"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product, CartItem, Cart } from "@/lib/store-types";

interface CartContextType {
	cart: Cart;
	addToCart: (product: Product, quantity?: number) => void;
	removeFromCart: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	isCartOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
	| { type: "ADD_TO_CART"; product: Product; quantity?: number }
	| { type: "REMOVE_FROM_CART"; productId: string }
	| { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
	| { type: "CLEAR_CART" }
	| { type: "OPEN_CART" }
	| { type: "CLOSE_CART" }
	| { type: "TOGGLE_CART" };

interface CartState {
	cart: Cart;
	isCartOpen: boolean;
}

function calculateCartTotals(items: CartItem[]): {
	total: number;
	itemCount: number;
} {
	const total = items.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0
	);
	const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
	return { total, itemCount };
}

function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case "ADD_TO_CART": {
			const existingItemIndex = state.cart.items.findIndex(
				(item) => item.product.id === action.product.id
			);

			let newItems: CartItem[];

			if (existingItemIndex >= 0) {
				newItems = state.cart.items.map((item, index) =>
					index === existingItemIndex
						? { ...item, quantity: item.quantity + (action.quantity || 1) }
						: item
				);
			} else {
				newItems = [
					...state.cart.items,
					{ product: action.product, quantity: action.quantity || 1 },
				];
			}

			const { total, itemCount } = calculateCartTotals(newItems);

			return {
				...state,
				cart: {
					items: newItems,
					total,
					itemCount,
				},
			};
		}

		case "REMOVE_FROM_CART": {
			const newItems = state.cart.items.filter(
				(item) => item.product.id !== action.productId
			);
			const { total, itemCount } = calculateCartTotals(newItems);

			return {
				...state,
				cart: {
					items: newItems,
					total,
					itemCount,
				},
			};
		}

		case "UPDATE_QUANTITY": {
			if (action.quantity <= 0) {
				return cartReducer(state, {
					type: "REMOVE_FROM_CART",
					productId: action.productId,
				});
			}

			const newItems = state.cart.items.map((item) =>
				item.product.id === action.productId
					? { ...item, quantity: action.quantity }
					: item
			);

			const { total, itemCount } = calculateCartTotals(newItems);

			return {
				...state,
				cart: {
					items: newItems,
					total,
					itemCount,
				},
			};
		}

		case "CLEAR_CART":
			return {
				...state,
				cart: {
					items: [],
					total: 0,
					itemCount: 0,
				},
			};

		case "OPEN_CART":
			return {
				...state,
				isCartOpen: true,
			};

		case "CLOSE_CART":
			return {
				...state,
				isCartOpen: false,
			};

		case "TOGGLE_CART":
			return {
				...state,
				isCartOpen: !state.isCartOpen,
			};

		default:
			return state;
	}
}

const initialState: CartState = {
	cart: {
		items: [],
		total: 0,
		itemCount: 0,
	},
	isCartOpen: false,
};

interface CartProviderProps {
	children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
	const [state, dispatch] = useReducer(cartReducer, initialState);

	const addToCart = (product: Product, quantity = 1) => {
		dispatch({ type: "ADD_TO_CART", product, quantity });
	};

	const removeFromCart = (productId: string) => {
		dispatch({ type: "REMOVE_FROM_CART", productId });
	};

	const updateQuantity = (productId: string, quantity: number) => {
		dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
	};

	const clearCart = () => {
		dispatch({ type: "CLEAR_CART" });
	};

	const openCart = () => {
		dispatch({ type: "OPEN_CART" });
	};

	const closeCart = () => {
		dispatch({ type: "CLOSE_CART" });
	};

	const toggleCart = () => {
		dispatch({ type: "TOGGLE_CART" });
	};

	const value: CartContextType = {
		cart: state.cart,
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		isCartOpen: state.isCartOpen,
		openCart,
		closeCart,
		toggleCart,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
