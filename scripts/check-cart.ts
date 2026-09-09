// Self-check for the pure cart core: reducer, totals, localStorage shape guard
// and variant resolution. No React, no network, no store credentials needed.
// Fails loudly on the first broken assertion.
//
// Run: npx tsx scripts/check-cart.ts
import assert from "node:assert/strict";

// cart-service reads `window`/`localStorage`. Stub them before importing it so
// the guard clauses take the browser path.
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).window = {};
(globalThis as Record<string, unknown>).localStorage = {
	getItem: (k: string) => store.get(k) ?? null,
	setItem: (k: string, v: string) => void store.set(k, v),
	removeItem: (k: string) => void store.delete(k),
};

import {
	calculateCartTotals,
	cartReducer,
	defaultSelection,
	hasAvailableVariant,
	hasSelectableOptions,
	initialCartState,
	resolveVariant,
	toCartLine,
	toDisplayVariantTitle,
	type CartState,
} from "../lib/cart/cart-reducer";
import {
	clearLocalStorageCart,
	loadCartFromLocalStorage,
	saveCartToLocalStorage,
} from "../lib/cart/cart-service";
import { MAX_LINES, MAX_QUANTITY_PER_LINE } from "../lib/shopify/cart-limits";
import type { CartLine } from "../lib/store-types";
import type { ShopifyVariantModel } from "../lib/shopify/types";

const gid = (n: number) => `gid://shopify/ProductVariant/${n}`;

function line(n: number, quantity = 1, price = 100): CartLine {
	return {
		variantId: gid(n),
		productId: "gid://shopify/Product/1",
		handle: "knee-brace",
		title: "Knee brace",
		variantTitle: "Large",
		imageUrl: null,
		price,
		quantity,
	};
}

/** Apply a sequence of actions to the initial state, the way the provider does. */
function run(...actions: Parameters<typeof cartReducer>[1][]): CartState {
	return actions.reduce(cartReducer, initialCartState);
}

// --- totals
assert.deepEqual(calculateCartTotals([]), { total: 0, itemCount: 0 });
assert.deepEqual(calculateCartTotals([line(1, 2, 100), line(2, 3, 50)]), {
	total: 350,
	itemCount: 5,
});

// --- ADD_LINE merges the same variant instead of adding a second row
{
	const state = run(
		{ type: "ADD_LINE", line: line(1, 2) },
		{ type: "ADD_LINE", line: line(1, 3) }
	);
	assert.equal(state.cart.items.length, 1);
	assert.equal(state.cart.items[0].quantity, 5);
	assert.equal(state.cart.itemCount, 5);
	assert.equal(state.cart.total, 500);
}

// --- a different variant of the same product is its own line
{
	const state = run(
		{ type: "ADD_LINE", line: line(1) },
		{ type: "ADD_LINE", line: line(2) }
	);
	assert.equal(state.cart.items.length, 2);
}

// --- quantity is capped, never unbounded
{
	const state = run({ type: "ADD_LINE", line: line(1, 500) });
	assert.equal(state.cart.items[0].quantity, MAX_QUANTITY_PER_LINE);

	const raised = cartReducer(state, {
		type: "SET_QUANTITY",
		variantId: gid(1),
		quantity: 1000,
	});
	assert.equal(raised.cart.items[0].quantity, MAX_QUANTITY_PER_LINE);
}

// --- the line count is capped too, and the cap drops the extra rather than throwing
{
	let state = initialCartState;
	for (let i = 0; i < MAX_LINES + 5; i += 1) {
		state = cartReducer(state, { type: "ADD_LINE", line: line(i) });
	}
	assert.equal(state.cart.items.length, MAX_LINES);
}

// --- stepping below one removes the line, so the "−" button needs no special case
{
	const state = run(
		{ type: "ADD_LINE", line: line(1, 1) },
		{ type: "SET_QUANTITY", variantId: gid(1), quantity: 0 }
	);
	assert.equal(state.cart.items.length, 0);
	assert.equal(state.cart.total, 0);
}

// --- remove and clear keep the totals in step
{
	const filled = run(
		{ type: "ADD_LINE", line: line(1, 2) },
		{ type: "ADD_LINE", line: line(2, 1) }
	);
	const removed = cartReducer(filled, {
		type: "REMOVE_LINE",
		variantId: gid(1),
	});
	assert.equal(removed.cart.items.length, 1);
	assert.equal(removed.cart.itemCount, 1);

	const cleared = cartReducer(filled, { type: "CLEAR" });
	assert.deepEqual(cleared.cart, { items: [], total: 0, itemCount: 0 });
}

// --- SET_CART is what flips `hydrated`; nothing else may
{
	assert.equal(initialCartState.hydrated, false);
	assert.equal(
		cartReducer(initialCartState, { type: "ADD_LINE", line: line(1) }).hydrated,
		false
	);
	assert.equal(
		cartReducer(initialCartState, { type: "SET_CART", items: [line(1)] })
			.hydrated,
		true
	);
}

// --- open/close/toggle leave the cart contents alone
{
	const opened = run(
		{ type: "ADD_LINE", line: line(1) },
		{ type: "OPEN_CART" }
	);
	assert.equal(opened.isCartOpen, true);
	assert.equal(cartReducer(opened, { type: "TOGGLE_CART" }).isCartOpen, false);
	assert.equal(cartReducer(opened, { type: "CLOSE_CART" }).isCartOpen, false);
	assert.equal(cartReducer(opened, { type: "CLOSE_CART" }).cart.itemCount, 1);
}

// --- localStorage round trip, and the guard that keeps v1 data out
{
	clearLocalStorageCart();
	assert.deepEqual(loadCartFromLocalStorage(), []);

	saveCartToLocalStorage([line(1, 2)]);
	assert.deepEqual(loadCartFromLocalStorage(), [line(1, 2)]);

	// The old key held whole Supabase products; that shape must never load.
	store.set(
		"doctoory_cart_v2",
		JSON.stringify([{ product: { id: 7, name: "Old" }, quantity: 1 }])
	);
	assert.deepEqual(loadCartFromLocalStorage(), []);

	// A single malformed line is dropped, the rest of the basket survives.
	store.set(
		"doctoory_cart_v2",
		JSON.stringify([line(1), { variantId: gid(2), quantity: 0 }])
	);
	assert.deepEqual(loadCartFromLocalStorage(), [line(1)]);

	store.set("doctoory_cart_v2", "not json at all");
	assert.deepEqual(loadCartFromLocalStorage(), []);

	store.set("doctoory_cart_v2", JSON.stringify({ items: [] }));
	assert.deepEqual(loadCartFromLocalStorage(), []);
	clearLocalStorageCart();
}

/* -------------------------------------------------------------------------- */
/*  Variant resolution                                                        */
/* -------------------------------------------------------------------------- */

function variant(
	id: number,
	size: string,
	colour: string,
	availableForSale: boolean
): ShopifyVariantModel {
	return {
		id: gid(id),
		title: `${size} / ${colour}`,
		availableForSale,
		selectedOptions: [
			{ name: "Size", value: size },
			{ name: "Colour", value: colour },
		],
		price: 100,
		compareAtPrice: null,
		discountPercent: null,
		imageUrl: null,
	};
}

// Small / Black is sold out; Large / White was never created at all.
const variants = [
	variant(1, "Small", "Black", false),
	variant(2, "Small", "White", true),
	variant(3, "Large", "Black", true),
];

assert.equal(
	resolveVariant(variants, { Size: "Small", Colour: "Black" })?.id,
	gid(1)
);
assert.equal(
	resolveVariant(variants, { Size: "Large", Colour: "White" }),
	null
);
// A partial selection is not a variant: it must not match one by accident.
assert.equal(resolveVariant(variants, { Size: "Small" }), null);

// A value is selectable only while some purchasable variant still lies behind it.
assert.equal(hasAvailableVariant(variants, { Size: "Small" }), true);
assert.equal(hasAvailableVariant(variants, { Colour: "White" }), true);
assert.equal(
	hasAvailableVariant(variants, { Size: "Small", Colour: "Black" }),
	false
);
assert.equal(
	hasAvailableVariant(variants, { Size: "Large", Colour: "White" }),
	false
);

// The panel opens on the first purchasable variant, not simply the first one.
assert.deepEqual(defaultSelection(variants), {
	Size: "Small",
	Colour: "White",
});
assert.deepEqual(defaultSelection([]), {});
assert.deepEqual(defaultSelection([variant(9, "Only", "Black", false)]), {
	Size: "Only",
	Colour: "Black",
});

// Shopify's synthetic single option is not something to render or display.
assert.equal(
	hasSelectableOptions([{ name: "Title", values: ["Default Title"] }]),
	false
);
assert.equal(
	hasSelectableOptions([{ name: "Size", values: ["S", "M"] }]),
	true
);
assert.equal(hasSelectableOptions([]), false);
assert.equal(toDisplayVariantTitle("Default Title"), null);
assert.equal(toDisplayVariantTitle(""), null);
assert.equal(toDisplayVariantTitle("Large / Black"), "Large / Black");

// --- toCartLine copies everything the sidebar and checkout need off the variant
{
	const product = {
		id: "gid://shopify/Product/1",
		title: "Knee brace",
		handle: "knee-brace",
		images: [{ url: "https://cdn.shopify.com/product.jpg" }],
	};
	const built = toCartLine(product, variants[2], 3);
	assert.equal(built.variantId, gid(3));
	assert.equal(built.handle, "knee-brace");
	assert.equal(built.variantTitle, "Large / Black");
	assert.equal(built.quantity, 3);
	// The variant has no image of its own, so the product's first image stands in.
	assert.equal(built.imageUrl, "https://cdn.shopify.com/product.jpg");
	assert.equal(
		toCartLine(product, variants[2], 999).quantity,
		MAX_QUANTITY_PER_LINE
	);
}

console.log("check-cart: all assertions passed");
