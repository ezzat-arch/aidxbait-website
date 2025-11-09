"use client";

import { Separator } from "@/components/ui/separator";
import { Cart } from "@/lib/store-types";
import { useTranslations } from "next-intl";

interface CartSummaryProps {
	cart: Cart;
	className?: string;
}

export function CartSummary({ cart, className }: CartSummaryProps) {
	const t = useTranslations("store.CartSummary.text");
	const subtotal = cart.total;
	const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
	const tax = subtotal * 0.08; // 8% tax
	const total = subtotal + shipping + tax;

	return (
		<div className={`space-y-4 ${className}`}>
			<h3 className="font-semibold">{t("order_summary")}</h3>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>
						{t("subtotal")} ({cart.itemCount} {t("items")})
					</span>
					<span>
						{subtotal.toFixed(2)} {t("egp")}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span>{t("shipping")}</span>
					<span>
						{shipping === 0 ? (
							<span className="text-green-600 font-medium">{t("free")}</span>
						) : (
							`${shipping.toFixed(2)} ${t("egp")}`
						)}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span>{t("tax")}</span>
					<span>
						{tax.toFixed(2)} {t("egp")}
					</span>
				</div>

				{shipping > 0 && (
					<div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
						{t("add")} {(50 - subtotal).toFixed(2)} {t("egp_more_for_free_shipping")}
					</div>
				)}
			</div>

			<Separator />

			<div className="flex justify-between font-semibold text-lg">
				<span>{t("total")}</span>
				<span>
					{total.toFixed(2)} {t("egp")}
				</span>
			</div>

			<div className="text-xs text-muted-foreground">
				{t("tax_calculated_at_checkout_final")}
			</div>
		</div>
	);
}
