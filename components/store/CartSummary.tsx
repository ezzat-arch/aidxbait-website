"use client";

import { Separator } from "@/components/ui/separator";
import type { Cart } from "@/lib/store-types";
import { useLocale, useTranslations } from "next-intl";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/i18n/utils";
import type { Locale } from "@/types/i18n";

/**
 * Subtotal only, on purpose.
 *
 * Tax, shipping and discounts are Shopify's to compute from its own settings,
 * and they are not known until the buyer has entered an address at checkout.
 * There used to be a 14% tax and a flat 50 EGP shipping fee in this repo; they
 * belonged to the Paymob flow, never described a Shopify order, and were removed
 * with it. Showing a total here would only risk a number that disagrees with the
 * one the buyer is actually charged.
 */
export function CartSummary({
	cart,
	className,
}: {
	cart: Cart;
	className?: string;
}) {
	const t = useTranslations("store.CartSummary.text");
	const locale = useLocale() as Locale;

	return (
		<div className={`space-y-4 ${className ?? ""}`}>
			<h3 className="font-semibold">{t("order_summary")}</h3>

			<Separator />

			<div className="flex justify-between font-semibold text-lg gap-2">
				<span>{t("subtotal")}</span>
				<span>{formatCurrency(cart.total, DEFAULT_CURRENCY, locale)}</span>
			</div>

			<p className="text-xs text-muted-foreground">
				{t("taxes_shipping_at_checkout")}
			</p>
		</div>
	);
}
