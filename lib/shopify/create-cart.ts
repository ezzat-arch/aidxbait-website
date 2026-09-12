// lib/shopify/create-cart.ts — create a Shopify cart and get its hosted-checkout URL

import { shopifyFetch } from "./client";
import { toCheckoutDomain } from "./checkout-url";
import { toShopifyLanguage, type ShopifyLanguageCode } from "./locale";
import { cartCreateMutation } from "./queries/cart";
import type {
	StorefrontCartCreateData,
	StorefrontCartInput,
	StorefrontCartLineInput,
	StorefrontCartPrefillInput,
} from "./types";

const LOG = "[Checkout]";

type CartUserError =
	StorefrontCartCreateData["cartCreate"]["userErrors"][number];

/** Shopify refused the cart (unknown variant, sold out, …). `message` is Shopify's own text. */
export class ShopifyCartError extends Error {
	constructor(
		message: string,
		readonly userErrors: CartUserError[] = []
	) {
		super(message);
		this.name = "ShopifyCartError";
	}
}

export type CreateShopifyCartParams = {
	lines: StorefrontCartLineInput[];
	/** App locale (`en` | `ar`). Sets the checkout language and the order's email language. */
	locale: string;
	/**
	 * Buyer/delivery pre-fill from `buildPrefilledCartInput`. If Shopify rejects
	 * a cart that carries it, the cart is created again without it: a pre-fill
	 * problem must never stop a purchase. Guests pass the bare store-country
	 * identity, which is never retried.
	 */
	prefill: StorefrontCartPrefillInput;
};

export type CreatedShopifyCart = { cartId: string; checkoutUrl: string };

/**
 * Creates a Shopify cart for the given lines and returns the URL of its hosted
 * checkout, already pointed at the custom checkout domain when one is set.
 *
 * Throws `ShopifyCartError` when Shopify refuses the lines themselves, and a
 * plain `Error` when Shopify cannot be reached or answers unexpectedly.
 */
export async function createShopifyCart({
	lines,
	locale,
	prefill,
}: CreateShopifyCartParams): Promise<CreatedShopifyCart> {
	const language = toShopifyLanguage(locale);

	try {
		return await runCartCreate({ lines, ...prefill }, language);
	} catch (error) {
		if (!carriesPrefill(prefill) || isLineProblem(error)) throw error;

		// The first failure is logged in full so a broken mapping stays visible,
		// but the buyer still gets a checkout.
		console.error(
			`${LOG} cartCreate with pre-fill failed, retrying without it:`,
			error instanceof Error ? error.message : error
		);
		const bare: StorefrontCartInput = {
			lines,
			buyerIdentity: prefill.buyerIdentity && {
				countryCode: prefill.buyerIdentity.countryCode,
			},
		};
		return await runCartCreate(bare, language);
	}
}

async function runCartCreate(
	input: StorefrontCartInput,
	language: ShopifyLanguageCode
): Promise<CreatedShopifyCart> {
	const { body } = await shopifyFetch<StorefrontCartCreateData>({
		query: cartCreateMutation,
		variables: { input },
		language,
		cache: "no-store",
	});

	const result = body.data?.cartCreate;
	const userErrors = result?.userErrors ?? [];
	if (userErrors.length > 0) {
		throw new ShopifyCartError(userErrors[0].message, userErrors);
	}

	for (const warning of result?.warnings ?? []) {
		// e.g. MERCHANDISE_NOT_ENOUGH_INVENTORY_AVAILABLE: Shopify capped a quantity.
		console.warn(`${LOG} cartCreate warning:`, warning.code, warning.message);
	}

	const cart = result?.cart;
	if (!cart?.checkoutUrl) {
		throw new Error("Shopify returned no checkoutUrl for the new cart");
	}

	return { cartId: cart.id, checkoutUrl: toCheckoutDomain(cart.checkoutUrl) };
}

/** True when there is something beyond the bare store country to drop on retry. */
function carriesPrefill(prefill: StorefrontCartPrefillInput): boolean {
	return Boolean(
		prefill.delivery ||
		prefill.attributes?.length ||
		prefill.buyerIdentity?.email ||
		prefill.buyerIdentity?.phone
	);
}

/**
 * True when every user error points at `input.lines`. Those are about the
 * products, not the pre-fill, so a retry without pre-fill cannot help. A null
 * or unfamiliar `field` path counts as "not sure", which retries.
 */
function isLineProblem(error: unknown): boolean {
	return (
		error instanceof ShopifyCartError &&
		error.userErrors.length > 0 &&
		error.userErrors.every((userError) => userError.field?.[1] === "lines")
	);
}
