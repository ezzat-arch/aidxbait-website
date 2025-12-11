"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/lib/order-types";
import { fetchOrders } from "@/lib/orders/order-service";
import { OrderCard } from "@/components/profile/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export default function MyOrdersPage() {
	const { userProfile } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

	const t = useTranslations("profile.my_orders.text");
	const tPlaceholder = useTranslations("profile.my_orders.attr.placeholder");
	const tStatus = useTranslations("profile.my_orders.data.status");
	const tToastTitle = useTranslations("profile.my_orders.toast.title");
	const tToastDesc = useTranslations("profile.my_orders.toast.description");

	useEffect(() => {
		if (userProfile?.patient_id) {
			loadOrders();
		}
	}, [userProfile?.patient_id, statusFilter]);

	const loadOrders = async () => {
		if (!userProfile?.patient_id) return;

		try {
			setLoading(true);
			const filters: { patient_id: number; order_status?: OrderStatus } = {
				patient_id: userProfile.patient_id,
			};

			if (statusFilter !== "all") {
				filters.order_status = statusFilter;
			}

			const { orders: data } = await fetchOrders(filters);
			setOrders(data);
		} catch (error) {
			console.error("Error loading orders:", error);
			toast({
				title: tToastTitle("error"),
				description: tToastDesc("failed_to_load_orders"),
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Get translated status label for empty state message
	const getStatusLabel = (status: OrderStatus | "all") => {
		return tStatus(status);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">{t("loading_orders")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold mb-2">{t("my_orders")}</h1>
					<p className="text-muted-foreground">{t("view_and_track")}</p>
				</div>

				<Select
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as OrderStatus | "all")
					}
				>
					<SelectTrigger className="w-full sm:w-[200px]">
						<SelectValue placeholder={tPlaceholder("filter_by_status")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{tStatus("all")}</SelectItem>
						<SelectItem value="pending">{tStatus("pending")}</SelectItem>
						<SelectItem value="confirmed">{tStatus("confirmed")}</SelectItem>
						<SelectItem value="shipped">{tStatus("shipped")}</SelectItem>
						<SelectItem value="delivered">{tStatus("delivered")}</SelectItem>
						<SelectItem value="cancelled">{tStatus("cancelled")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{orders.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
						<Package className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="font-semibold text-lg mb-2">
						{statusFilter === "all"
							? t("no_orders_yet")
							: t("no_status_orders", { status: getStatusLabel(statusFilter) })}
					</h3>
					<p className="text-muted-foreground mb-6">
						{statusFilter === "all"
							? t("your_order_history")
							: t("try_changing_filter")}
					</p>
					{statusFilter !== "all" && (
						<Button variant="outline" onClick={() => setStatusFilter("all")}>
							{t("view_all_orders")}
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{orders.map((order) => (
						<OrderCard key={order.id} order={order} />
					))}
				</div>
			)}
		</div>
	);
}
