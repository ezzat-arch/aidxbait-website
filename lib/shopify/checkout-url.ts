// lib/shopify/checkout-url.ts — point Shopify checkout links at our own domain

const MYSHOPIFY_SUFFIX = ".myshopify.com";

/**
 * Rewrites a Storefront `checkoutUrl` to the store's custom checkout domain
 * (`SHOPIFY_CHECKOUT_DOMAIN`, e.g. `shop.doctoory.com`) so the buyer never
 * sees `*.myshopify.com`.
 *
 * Only `*.myshopify.com` hosts are touched. Shopify also hands out checkout
 * URLs on its own domains (Shop Pay, `checkout.shopify.com`) and those must be
 * left alone. When the env var is unset, or the URL does not parse, the input
 * comes back unchanged, so this can never break a checkout link.
 *
 * Set `SHOPIFY_CHECKOUT_DOMAIN` only once the domain is live in Shopify admin
 * (Settings → Domains), otherwise every checkout link points at a dead host.
 */
export function toCheckoutDomain(
	checkoutUrl: string,
	checkoutDomain: string | undefined = process.env.SHOPIFY_CHECKOUT_DOMAIN
): string {
	const domain = checkoutDomain?.trim().toLowerCase();
	if (!domain) return checkoutUrl;

	let url: URL;
	try {
		url = new URL(checkoutUrl);
	} catch {
		return checkoutUrl;
	}

	if (!url.hostname.endsWith(MYSHOPIFY_SUFFIX)) return checkoutUrl;

	url.host = domain;
	return url.toString();
}
