import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types/i18n";
import { createClient } from "@/lib/supabase/server";
import {
	buildPrefilledCartInput,
	createShopifyCart,
	ShopifyCartError,
	type CheckoutPrefill,
	MAX_LINES,
	MAX_QUANTITY_PER_LINE,
	VARIANT_GID_PREFIX,
	type StorefrontCartLineInput,
} from "@/lib/shopify";
import { getCheckoutPrefill } from "@/lib/shopify/checkout-prefill";

const LOG = "[Checkout]";

type CheckoutRequest = { lines: StorefrontCartLineInput[]; locale: Locale };

/**
 * POST /api/checkout
 *
 * Creates a Shopify cart and returns the URL of its hosted checkout.
 *
 * Body:     `{ lines: [{ merchandiseId: "gid://shopify/ProductVariant/…", quantity: 1 }], locale?: "en" | "ar" }`
 * Response: `{ success: true, data: { checkoutUrl } }`
 *   400 — malformed body, or Shopify refused the lines (sold out, unknown variant)
 *   500 — Shopify unreachable or answered unexpectedly
 *
 * Works for guests. When the request carries a Supabase session, the buyer's
 * email, phone and saved address are pre-filled into the cart so checkout
 * arrives already completed. A missing or broken session only means no
 * pre-fill: checkout is never refused for auth reasons.
 */
export async function POST(request: NextRequest) {
	try {
		const parsed = parseCheckoutRequest(await readJson(request));
		if ("error" in parsed) {
			return NextResponse.json(
				{ success: false, error: parsed.error },
				{ status: 400 }
			);
		}
		const { lines, locale } = parsed;

		const prefill = await getSessionPrefill();

		const { checkoutUrl } = await createShopifyCart({
			lines,
			locale,
			prefill: buildPrefilledCartInput(prefill),
		});

		console.log(`${LOG} cart created`, {
			lines: lines.length,
			locale,
			prefilled: prefill !== null,
			savedAddress: Boolean(prefill?.address),
		});

		return NextResponse.json({ success: true, data: { checkoutUrl } });
	} catch (error) {
		if (error instanceof ShopifyCartError) {
			console.error(`${LOG} Shopify refused the cart:`, error.userErrors);
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 400 }
			);
		}
		console.error(`${LOG} failed to create checkout:`, error);
		return NextResponse.json(
			{ success: false, error: "Failed to create checkout" },
			{ status: 500 }
		);
	}
}

/** Malformed JSON is the caller's problem, so it becomes a 400 rather than a 500. */
async function readJson(request: NextRequest): Promise<unknown> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

function parseCheckoutRequest(
	body: unknown
): CheckoutRequest | { error: string } {
	if (!body || typeof body !== "object") {
		return { error: "Request body must be a JSON object" };
	}
	const { lines, locale } = body as { lines?: unknown; locale?: unknown };

	if (!Array.isArray(lines) || lines.length === 0) {
		return { error: "lines must be a non-empty array" };
	}
	if (lines.length > MAX_LINES) {
		return { error: `lines must contain at most ${MAX_LINES} items` };
	}

	const parsedLines: StorefrontCartLineInput[] = [];
	for (const line of lines) {
		const { merchandiseId, quantity } = (line ?? {}) as {
			merchandiseId?: unknown;
			quantity?: unknown;
		};
		if (
			typeof merchandiseId !== "string" ||
			!merchandiseId.startsWith(VARIANT_GID_PREFIX)
		) {
			return {
				error: `Each line needs a merchandiseId starting with ${VARIANT_GID_PREFIX}`,
			};
		}
		if (
			typeof quantity !== "number" ||
			!Number.isInteger(quantity) ||
			quantity < 1 ||
			quantity > MAX_QUANTITY_PER_LINE
		) {
			return {
				error: `Each line needs an integer quantity between 1 and ${MAX_QUANTITY_PER_LINE}`,
			};
		}
		parsedLines.push({ merchandiseId, quantity });
	}

	return { lines: parsedLines, locale: toLocale(locale) };
}

/** Unknown or missing locales fall back to the default instead of failing the request. */
function toLocale(value: unknown): Locale {
	const locales = routing.locales as readonly string[];
	return typeof value === "string" && locales.includes(value)
		? (value as Locale)
		: (routing.defaultLocale as Locale);
}

/**
 * Resolves the caller's pre-fill from their Supabase session cookie, or null
 * for guests. `middleware.ts` skips `/api/*`, which only means the session is
 * not refreshed on the way in; `cookies()` still exposes it to this handler.
 */
async function getSessionPrefill(): Promise<CheckoutPrefill | null> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return null;
		return await getCheckoutPrefill({ id: user.id, email: user.email ?? null });
	} catch (error) {
		console.error(`${LOG} session lookup failed, continuing as guest:`, error);
		return null;
	}
}
