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
	clearCartOnServer,
} from "@/lib/cart/cart-service";
import { toast } from "@/hooks/use-toast";
import { eventService } from "@/lib/tracking/event-service";

interface CartContextType {
	cart: Cart;
	addToCart: (
		product: Product,
		quantity?: number,
		rentalWeeks?: number
	) => void;
	removeFromCart: (productId: number) => void;
	updateQuantity: (productId: number, quantity: number) => void;
	updateRentalWeeks: (productId: number, weeks: number) => void;
	clearCart: () => Promise<void>;
	isCartOpen: boolean;
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;
	isSyncing: boolean;
	syncError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
	| {
			type: "ADD_TO_CART";
			product: Product;
			quantity?: number;
			rentalWeeks?: number;
	  }
	| { type: "REMOVE_FROM_CART"; productId: number }
	| { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
	| { type: "UPDATE_RENTAL_WEEKS"; productId: number; weeks: number }
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
						? {
								...item,
								quantity: item.quantity + (action.quantity || 1),
								rental_weeks:
									action.rentalWeeks !== undefined
										? action.rentalWeeks
										: item.rental_weeks,
						  }
						: item
				);
			} else {
				newItems = [
					...state.cart.items,
					{
						product: action.product,
						quantity: action.quantity || 1,
						rental_weeks: action.rentalWeeks,
					},
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

		case "UPDATE_RENTAL_WEEKS": {
			const newItems = state.cart.items.map((item) =>
				item.product.id === action.productId
					? { ...item, rental_weeks: action.weeks }
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
	const isManualClearRef = useRef(false);

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

		// Skip debounced sync if this was a manual clear (clearCart() handles sync immediately)
		if (isManualClearRef.current) {
			isManualClearRef.current = false;
			return;
		}

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

	const addToCart = (product: Product, quantity = 1, rentalWeeks?: number) => {
		dispatch({ type: "ADD_TO_CART", product, quantity, rentalWeeks });

		// Track cart event
		const newCartValue =
			state.cart.total +
			(product.discounted_price || product.price) * quantity;
		const newItemCount = state.cart.itemCount + quantity;

		eventService.trackCartEvent("add", {
			productId: product.id,
			quantity,
			rentalWeeks,
			cartValue: newCartValue,
			cartItemCount: newItemCount,
		});
	};

	const removeFromCart = (productId: number) => {
		// Find the item being removed to track its quantity
		const item = state.cart.items.find((i) => i.product.id === productId);
		const removedQuantity = item?.quantity || 0;

		dispatch({ type: "REMOVE_FROM_CART", productId });

		// Track cart event
		const newCartValue = item
			? state.cart.total -
			  (item.product.discounted_price || item.product.price) * item.quantity
			: state.cart.total;
		const newItemCount = state.cart.itemCount - removedQuantity;

		eventService.trackCartEvent("remove", {
			productId,
			quantity: removedQuantity,
			cartValue: newCartValue,
			cartItemCount: newItemCount,
		});
	};

	const updateQuantity = (productId: number, quantity: number) => {
		// Find the item to get previous quantity
		const item = state.cart.items.find((i) => i.product.id === productId);
		const previousQuantity = item?.quantity || 0;

		dispatch({ type: "UPDATE_QUANTITY", productId, quantity });

		// Calculate new cart value
		const quantityDiff = quantity - previousQuantity;
		const newCartValue = item
			? state.cart.total +
			  (item.product.discounted_price || item.product.price) * quantityDiff
			: state.cart.total;
		const newItemCount = state.cart.itemCount + quantityDiff;

		// Track cart event
		eventService.trackCartEvent("update_quantity", {
			productId,
			quantity,
			previousQuantity,
			cartValue: newCartValue,
			cartItemCount: newItemCount,
		});
	};

	const updateRentalWeeks = (productId: number, weeks: number) => {
		dispatch({ type: "UPDATE_RENTAL_WEEKS", productId, weeks });
	};

	const clearCart = async () => {
		// Set flag to prevent debounced sync from firing
		isManualClearRef.current = true;

		// Track clear event before clearing
		eventService.trackCartEvent("clear", {
			cartValue: state.cart.total,
			cartItemCount: state.cart.itemCount,
		});

		// Immediately clear client-side state and localStorage
		dispatch({ type: "CLEAR_CART" });

		// Immediately sync to server if user is logged in
		if (userProfile?.id) {
			try {
				setIsSyncing(true);
				setSyncError(null);
				await clearCartOnServer(userProfile.id);
				console.log("[CartContext] Cart cleared successfully on server");
			} catch (error) {
				console.error("[CartContext] Failed to clear cart on server:", error);
				setSyncError(
					error instanceof Error ? error.message : "Failed to clear cart"
				);
				// Don't show toast here - let the calling component handle UI feedback
			} finally {
				setIsSyncing(false);
			}
		}
	};

	const openCart = () => {
		dispatch({ type: "OPEN_CART" });
		eventService.trackCartEvent("open", {
			cartValue: state.cart.total,
			cartItemCount: state.cart.itemCount,
		});
	};

	const closeCart = () => {
		dispatch({ type: "CLOSE_CART" });
		eventService.trackCartEvent("close", {
			cartValue: state.cart.total,
			cartItemCount: state.cart.itemCount,
		});
	};

	const toggleCart = () => {
		dispatch({ type: "TOGGLE_CART" });
		const eventType = state.isCartOpen ? "close" : "open";
		eventService.trackCartEvent(eventType, {
			cartValue: state.cart.total,
			cartItemCount: state.cart.itemCount,
		});
	};

	const value: CartContextType = {
		cart: state.cart,
		addToCart,
		removeFromCart,
		updateQuantity,
		updateRentalWeeks,
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
