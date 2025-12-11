"use client";

import { Order } from "@/lib/order-types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import { Package, Calendar, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/orders/order-service";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface OrderCardProps {
	order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
	const t = useTranslations("profile.orders.text");
	const tOrderType = useTranslations("profile.orders.data.order_type");
	const tPaymentMethod = useTranslations("profile.orders.data.payment_method");
	const locale = useLocale();

	const orderDate = new Date(order.order_date).toLocaleDateString(
		locale === "ar" ? "ar-EG" : "en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		}
	);

	const itemCount =
		order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

	// Get order type translation key
	const getOrderTypeKey = (type: string) => {
		return type === "rental" ? "rental" : "purchase";
	};

	// Get payment method translation key
	const getPaymentMethodKey = (method: string) => {
		return method === "cash_on_delivery" ? "cash_on_delivery" : "online";
	};

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="font-semibold text-sm text-muted-foreground">
								{t("order")} #{order.id}
							</span>
							<Badge variant="outline">
								{tOrderType(getOrderTypeKey(order.order_type))}
							</Badge>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>{orderDate}</span>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<OrderStatusBadge status={order.order_status} />
						<PaymentStatusBadge
							status={order.payment_status}
							paymentMethod={order.payment_method}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Package className="h-4 w-4" />
						<span>
							{itemCount} {itemCount === 1 ? t("item") : t("items")}
						</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<CreditCard className="h-4 w-4" />
						<span>
							{tPaymentMethod(getPaymentMethodKey(order.payment_method))}
						</span>
					</div>
				</div>

				<div className="pt-2 border-t">
					<div className="flex items-center justify-between">
						<span className="font-semibold text-lg">
							{formatCurrency(order.total_amount, "EGP")}
						</span>
						<Button asChild variant="outline" size="sm">
							<Link href={`/profile/my-orders/${order.id}`}>
								{t("view_details")}
								<ChevronRight className="h-4 w-4 ltr:ml-1 rtl:mr-1 rtl:rotate-180" />
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
