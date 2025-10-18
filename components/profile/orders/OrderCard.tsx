"use client";

import { Order } from "@/lib/order-types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import { Package, Calendar, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/orders/order-service";

interface OrderCardProps {
	order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
	const orderDate = new Date(order.order_date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const itemCount =
		order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="font-semibold text-sm text-muted-foreground">
								Order #{order.id}
							</span>
							<Badge variant="outline" className="capitalize">
								{order.order_type}
							</Badge>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>{orderDate}</span>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<OrderStatusBadge status={order.order_status} />
						<PaymentStatusBadge status={order.payment_status} />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Package className="h-4 w-4" />
						<span>
							{itemCount} {itemCount === 1 ? "item" : "items"}
						</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground capitalize">
						<CreditCard className="h-4 w-4" />
						<span>{order.payment_method.replace("_", " ")}</span>
					</div>
				</div>

				<div className="pt-2 border-t">
					<div className="flex items-center justify-between">
						<span className="font-semibold text-lg">
							{formatCurrency(order.total_amount, "EGP")}
						</span>
						<Button asChild variant="outline" size="sm">
							<Link href={`/profile/my-orders/${order.id}`}>
								View Details
								<ChevronRight className="h-4 w-4 ml-1" />
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
