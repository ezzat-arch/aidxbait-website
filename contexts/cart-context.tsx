"use client";

import React, {
	createContext,
	useContext,
	useReducer,
	ReactNode,
	useEffect,
	useRef,
	useCallback,
} from "react";
import { Product, CartItem, Cart } from "@/lib/store-types";
import { useAuth } from "@/contexts/auth-context";
import {
	loadCartFromLocalStorage,
	saveCartToLocalStorage,
	syncCartToServer,
	fetchCartFromServer,
} from "@/lib/cart/cart-service";
import { toast } from "@/hooks/use-toast";

interface CartContextType {
	cart: Cart;
	addToCart: (product: Product, quantity?: number) => void;
	removeFromCart: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	clearCart: () => void;
	isCartOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;
	isSyncing: boolean;
	syncError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
	| { type: "ADD_TO_CART"; product: Product; quantity?: number }
	| { type: "REMOVE_FROM_CART"; productId: number }
	| { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
	| { type: "CLEAR_CART" }
	| { type: "SET_CART"; items: CartItem[] }
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
	const total = items.reduce((sum, item) => {
		const effectivePrice = item.product.discounted_price || item.product.price;
		return sum + effectivePrice * item.quantity;
	}, 0);
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

		case "SET_CART": {
			const { total, itemCount } = calculateCartTotals(action.items);
			return {
				...state,
				cart: {
					items: action.items,
					total,
					itemCount,
				},
			};
		}

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
	const { user, userProfile, loading: authLoading } = useAuth();
	const [isSyncing, setIsSyncing] = React.useState(false);
	const [syncError, setSyncError] = React.useState<string | null>(null);
	const isInitialized = useRef(false);
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const previousUserIdRef = useRef<number | null>(null);

	const performSync = useCallback(
		async (items: CartItem[]) => {
			if (!userProfile?.id) return;

			setIsSyncing(true);
			setSyncError(null);

			try {
				await syncCartToServer(userProfile.id, items);
			} catch (error) {
				console.error("[CartContext] Sync failed:", error);
				setSyncError(error instanceof Error ? error.message : "Sync failed");
				toast({
					title: "Cart sync issue",
					description: "Failed to sync cart. Your cart is saved locally.",
					variant: "destructive",
				});
			} finally {
				setIsSyncing(false);
			}
		},
		[userProfile?.id]
	);

	useEffect(() => {
		if (authLoading || isInitialized.current) return;

		const localItems = loadCartFromLocalStorage();

		if (localItems.length > 0) {
			dispatch({ type: "SET_CART", items: localItems });
		}

		if (userProfile?.id && localItems.length > 0) {
			performSync(localItems);
		}

		isInitialized.current = true;
	}, [authLoading, userProfile?.id, performSync]);

	useEffect(() => {
		if (authLoading || !isInitialized.current) return;

		const currentUserId = userProfile?.id || null;
		const previousUserId = previousUserIdRef.current;

		if (currentUserId && currentUserId !== previousUserId) {
			const localItems = loadCartFromLocalStorage();
			if (localItems.length > 0) {
				performSync(localItems);
			}
		}

		if (!currentUserId && previousUserId) {
			console.log("[CartContext] User logged out, keeping localStorage cart");
		}

		previousUserIdRef.current = currentUserId;
	}, [userProfile?.id, authLoading, performSync]);

	useEffect(() => {
		if (!isInitialized.current) return;

		saveCartToLocalStorage(state.cart.items);

		if (syncTimeoutRef.current) {
			clearTimeout(syncTimeoutRef.current);
		}

		if (userProfile?.id) {
			syncTimeoutRef.current = setTimeout(() => {
				performSync(state.cart.items);
			}, 300);
		}

		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [state.cart.items, userProfile?.id, performSync]);

	const addToCart = (product: Product, quantity = 1) => {
		dispatch({ type: "ADD_TO_CART", product, quantity });
	};

	const removeFromCart = (productId: number) => {
		dispatch({ type: "REMOVE_FROM_CART", productId });
	};

	const updateQuantity = (productId: number, quantity: number) => {
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
		isSyncing,
		syncError,
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
