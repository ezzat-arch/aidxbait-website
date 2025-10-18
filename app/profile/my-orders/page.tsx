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

export default function MyOrdersPage() {
	const { userProfile } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

	useEffect(() => {
		if (userProfile?.patient_id) {
			loadOrders();
		}
	}, [userProfile?.patient_id, statusFilter]);

	const loadOrders = async () => {
		if (!userProfile?.patient_id) return;

		try {
			setLoading(true);
			const filters: any = {
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
				title: "Error",
				description: "Failed to load orders. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading orders...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold mb-2">My Orders</h1>
					<p className="text-muted-foreground">
						View and track your order history
					</p>
				</div>

				<Select
					value={statusFilter}
					onValueChange={(value) =>
						setStatusFilter(value as OrderStatus | "all")
					}
				>
					<SelectTrigger className="w-full sm:w-[200px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Orders</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="confirmed">Confirmed</SelectItem>
						<SelectItem value="shipped">Shipped</SelectItem>
						<SelectItem value="delivered">Delivered</SelectItem>
						<SelectItem value="cancelled">Cancelled</SelectItem>
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
							? "No orders yet"
							: `No ${statusFilter} orders`}
					</h3>
					<p className="text-muted-foreground mb-6">
						{statusFilter === "all"
							? "Your order history will appear here"
							: "Try changing the filter to view other orders"}
					</p>
					{statusFilter !== "all" && (
						<Button variant="outline" onClick={() => setStatusFilter("all")}>
							View All Orders
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
