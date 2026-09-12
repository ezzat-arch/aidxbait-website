/**
 * The cart's pure core: state shape, reducer, totals and variant resolution.
 *
 * Deliberately free of React, next-intl and the tracking service so that
 * `scripts/check-cart.ts` can exercise it directly under `tsx`. The provider in
 * `contexts/cart-context.tsx` is a thin wrapper over what lives here.
 */

import type { Cart, CartLine } from "@/lib/store-types";
import type { ShopifyVariantModel } from "@/lib/shopify/types";
import { MAX_LINES, MAX_QUANTITY_PER_LINE } from "@/lib/shopify/cart-limits";

export interface CartState {
	cart: Cart;
	isCartOpen: boolean;
	/**
	 * False until localStorage has been read. The provider renders the empty cart
	 * on the server and on the first client commit, then hydrates; saving before
	 * this flips would write `[]` over a stored cart.
	 */
	hydrated: boolean;
}

export type CartAction =
	| { type: "ADD_LINE"; line: CartLine }
	| { type: "REMOVE_LINE"; variantId: string }
	| { type: "SET_QUANTITY"; variantId: string; quantity: number }
	| { type: "CLEAR" }
	| { type: "SET_CART"; items: CartLine[] }
	| { type: "OPEN_CART" }
	| { type: "CLOSE_CART" }
	| { type: "TOGGLE_CART" };

export const initialCartState: CartState = {
	cart: { items: [], total: 0, itemCount: 0 },
	isCartOpen: false,
	hydrated: false,
};

export function calculateCartTotals(items: CartLine[]): {
	total: number;
	itemCount: number;
} {
	return {
		total: items.reduce((sum, line) => sum + line.price * line.quantity, 0),
		itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
	};
}

/** Rebuild the cart around a new set of lines, keeping totals in step with them. */
function withItems(state: CartState, items: CartLine[]): CartState {
	return { ...state, cart: { items, ...calculateCartTotals(items) } };
}

function clampQuantity(quantity: number): number {
	return Math.min(Math.max(Math.trunc(quantity), 1), MAX_QUANTITY_PER_LINE);
}

export function cartReducer(state: CartState, action: CartAction): CartState {
	switch (action.type) {
		case "ADD_LINE": {
			const index = state.cart.items.findIndex(
				(line) => line.variantId === action.line.variantId
			);

			// A variant already in the cart gains quantity rather than a second row,
			// which is also what Shopify does when the same merchandise is added twice.
			if (index >= 0) {
				const items = state.cart.items.map((line, i) =>
					i === index
						? {
								...line,
								quantity: clampQuantity(line.quantity + action.line.quantity),
							}
						: line
				);
				return withItems(state, items);
			}

			// Silently ignore rather than throw: the cap is a guard against a runaway
			// cart, and dropping the 51st line is better than failing the click.
			if (state.cart.items.length >= MAX_LINES) return state;

			return withItems(state, [
				...state.cart.items,
				{ ...action.line, quantity: clampQuantity(action.line.quantity) },
			]);
		}

		case "REMOVE_LINE":
			return withItems(
				state,
				state.cart.items.filter((line) => line.variantId !== action.variantId)
			);

		case "SET_QUANTITY": {
			// Stepping below one removes the line, so the "−" button needs no special case.
			if (action.quantity < 1) {
				return cartReducer(state, {
					type: "REMOVE_LINE",
					variantId: action.variantId,
				});
			}
			const items = state.cart.items.map((line) =>
				line.variantId === action.variantId
					? { ...line, quantity: clampQuantity(action.quantity) }
					: line
			);
			return withItems(state, items);
		}

		case "CLEAR":
			return withItems(state, []);

		case "SET_CART":
			return { ...withItems(state, action.items), hydrated: true };

		case "OPEN_CART":
			return { ...state, isCartOpen: true };

		case "CLOSE_CART":
			return { ...state, isCartOpen: false };

		case "TOGGLE_CART":
			return { ...state, isCartOpen: !state.isCartOpen };

		default:
			return state;
	}
}

/* -------------------------------------------------------------------------- */
/*  Variant selection                                                         */
/* -------------------------------------------------------------------------- */

/** A buyer's picks, keyed by option name: `{ Size: "Large", Colour: "Black" }`. */
export type VariantSelection = Record<string, string>;

function matchesSelection(
	variant: ShopifyVariantModel,
	selection: VariantSelection
): boolean {
	return Object.entries(selection).every(([name, value]) =>
		variant.selectedOptions.some(
			(option) => option.name === name && option.value === value
		)
	);
}

/**
 * The variant a full selection names, or null when the combination does not
 * exist (Shopify lets a merchant leave holes in the option grid). Resolved
 * locally from the variants already on the page, so changing an option costs
 * no round trip.
 */
export function resolveVariant(
	variants: ShopifyVariantModel[],
	selection: VariantSelection
): ShopifyVariantModel | null {
	return (
		variants.find(
			(variant) =>
				variant.selectedOptions.length === Object.keys(selection).length &&
				matchesSelection(variant, selection)
		) ?? null
	);
}

/**
 * Whether any purchasable variant still matches a partial selection. Used to
 * grey out an option value that cannot lead anywhere, e.g. a size only ever
 * stocked in a colour the buyer has not picked.
 */
export function hasAvailableVariant(
	variants: ShopifyVariantModel[],
	selection: VariantSelection
): boolean {
	return variants.some(
		(variant) =>
			variant.availableForSale && matchesSelection(variant, selection)
	);
}

/**
 * What the option selectors start on: the first purchasable variant, falling
 * back to the first variant so a sold-out product still renders a selection.
 */
export function defaultSelection(
	variants: ShopifyVariantModel[]
): VariantSelection {
	const variant = variants.find((v) => v.availableForSale) ?? variants[0];
	if (!variant) return {};

	return Object.fromEntries(
		variant.selectedOptions.map((option) => [option.name, option.value])
	);
}

/**
 * Whether the buyer has anything to choose. Shopify gives an option-less product
 * one synthetic option ("Title" / "Default Title"), and an option with a single
 * value leaves nothing to pick either, so neither is worth rendering.
 */
export function hasSelectableOptions(
	options: Array<{ name: string; values: string[] }>
): boolean {
	return options.some((option) => option.values.length > 1);
}

/**
 * Shopify names the single variant of an option-less product "Default Title".
 * That is an internal label, never something to show a buyer.
 */
export const DEFAULT_VARIANT_TITLE = "Default Title";

export function toDisplayVariantTitle(title: string): string | null {
	return title && title !== DEFAULT_VARIANT_TITLE ? title : null;
}

/** Build the cart line for a variant of a product. */
export function toCartLine(
	product: {
		id: string;
		title: string;
		handle: string;
		images: Array<{ url: string }>;
	},
	variant: ShopifyVariantModel,
	quantity: number
): CartLine {
	return {
		variantId: variant.id,
		productId: product.id,
		handle: product.handle,
		title: product.title,
		variantTitle: toDisplayVariantTitle(variant.title),
		imageUrl: variant.imageUrl ?? product.images[0]?.url ?? null,
		price: variant.price,
		quantity: clampQuantity(quantity),
	};
}
