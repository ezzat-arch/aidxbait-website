"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/orders/order-service";
import { OrderCalculation } from "@/lib/order-types";
import { useTranslations } from "next-intl";

interface OrderSummaryCheckoutProps {
	calculation: OrderCalculation;
}

export function OrderSummaryCheckout({
	calculation,
}: OrderSummaryCheckoutProps) {
	const t = useTranslations("store.checkout.text");

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("order_summary")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">{t("subtotal")}</span>
					<span>{formatCurrency(calculation.subtotal, "EGP")}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">{t("tax_14")}</span>
					<span>{formatCurrency(calculation.tax, "EGP")}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">{t("shipping")}</span>
					<span>{formatCurrency(calculation.shipping, "EGP")}</span>
				</div>
				{calculation.discount > 0 && (
					<div className="flex justify-between text-sm text-green-600">
						<span>{t("discount")}</span>
						<span>-{formatCurrency(calculation.discount, "EGP")}</span>
					</div>
				)}
				<Separator />
				<div className="flex justify-between font-semibold text-lg">
					<span>{t("total")}</span>
					<span>{formatCurrency(calculation.total, "EGP")}</span>
				</div>
			</CardContent>
		</Card>
	);
}
