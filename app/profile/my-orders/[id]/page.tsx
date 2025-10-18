"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Order } from "@/lib/order-types";
import { fetchOrderDetails, formatCurrency } from "@/lib/orders/order-service";
import {
	OrderStatusBadge,
	PaymentStatusBadge,
} from "@/components/profile/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/profile/orders/OrderTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Package, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function OrderDetailsPage() {
	const { userProfile } = useAuth();
	const params = useParams();
	const router = useRouter();
	const orderId = parseInt(params.id as string);

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (userProfile?.patient_id && orderId) {
			loadOrder();
		}
	}, [userProfile?.patient_id, orderId]);

	const loadOrder = async () => {
		if (!userProfile?.patient_id) return;

		try {
			setLoading(true);
			const data = await fetchOrderDetails(orderId, userProfile.patient_id);
			setOrder(data);
		} catch (error) {
			console.error("Error loading order:", error);
			toast({
				title: "Error",
				description: "Failed to load order details. Please try again.",
				variant: "destructive",
			});
			router.push("/profile/my-orders");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading order details...</p>
				</div>
			</div>
		);
	}

	if (!order) {
		return null;
	}

	const orderDate = new Date(order.order_date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="space-y-6">
			<div>
				<Button variant="ghost" asChild className="-ml-4 mb-4">
					<Link href="/profile/my-orders">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Orders
					</Link>
				</Button>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>{orderDate}</span>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<OrderStatusBadge status={order.order_status} />
						<PaymentStatusBadge
							status={order.payment_status}
							paymentMethod={order.payment_method}
						/>
					</div>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Order Items */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="h-5 w-5" />
								Order Items
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{order.order_items?.map((item) => {
								// API returns 'products' (plural) with nested 'product_images'
								const product = (item as any).products || item.product;
								const productImages =
									product?.product_images || product?.images || [];
								const mainImage =
									productImages?.find((img: any) => img.is_main)?.image_url ||
									productImages?.[0]?.image_url ||
									"/placeholder.jpg";

								return (
									<div key={item.id} className="flex gap-4">
										<div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
											<Image
												src={mainImage}
												alt={product?.name || "Product"}
												fill
												className="object-cover"
												sizes="80px"
												unoptimized
												onError={(e) => {
													const target = e.currentTarget;
													// Prevent infinite loop: only set fallback if not already on placeholder
													if (!target.src.includes("placeholder.jpg")) {
														target.src = "/placeholder.jpg";
													}
												}}
											/>
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium line-clamp-2">
												{product?.name}
											</h4>
											<div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
												<span>Quantity: {item.quantity}</span>
												{product?.is_for_rent && item.rental_start_date && (
													<>
														<span>•</span>
														<Badge variant="outline" className="text-xs">
															Rental
														</Badge>
													</>
												)}
											</div>
											{item.rental_start_date && item.rental_end_date && (
												<p className="text-xs text-muted-foreground mt-1">
													Rental:{" "}
													{new Date(
														item.rental_start_date
													).toLocaleDateString()}{" "}
													-{" "}
													{new Date(item.rental_end_date).toLocaleDateString()}
												</p>
											)}
										</div>
										<div className="text-right">
											<p className="font-semibold">
												{formatCurrency(item.price_at_purchase, "EGP")}
											</p>
											<p className="text-sm text-muted-foreground">
												× {item.quantity}
											</p>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>

					{/* Order Timeline */}
					<Card>
						<CardHeader>
							<CardTitle>Order Timeline</CardTitle>
						</CardHeader>
						<CardContent>
							<OrderTimeline order={order} />
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>{formatCurrency(order.subtotal_amount, "EGP")}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Tax (14%)</span>
								<span>{formatCurrency(order.tax_amount, "EGP")}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Shipping</span>
								<span>{formatCurrency(order.shipping_amount, "EGP")}</span>
							</div>
							{order.discount_amount > 0 && (
								<div className="flex justify-between text-sm text-green-600">
									<span>Discount</span>
									<span>-{formatCurrency(order.discount_amount, "EGP")}</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between font-semibold text-lg">
								<span>Total</span>
								<span>{formatCurrency(order.total_amount, "EGP")}</span>
							</div>
						</CardContent>
					</Card>

					{/* Payment Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="h-5 w-5" />
								Payment
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Method</span>
								<span className="capitalize">
									{order.payment_method.replace(/_/g, " ")}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Status</span>
								<PaymentStatusBadge
									status={order.payment_status}
									paymentMethod={order.payment_method}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Shipping Address */}
					{order.shipping_address && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Shipping Address
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-sm space-y-1">
									<p className="font-medium">
										{order.shipping_address.address_label}
									</p>
									<p className="text-muted-foreground">
										{order.shipping_address.street}
										{order.shipping_address.building_name &&
											`, ${order.shipping_address.building_name}`}
									</p>
									<p className="text-muted-foreground">
										{order.shipping_address.city},{" "}
										{order.shipping_address.governorate}
									</p>
									{order.shipping_address.phone && (
										<p className="text-muted-foreground">
											Phone: {order.shipping_address.phone}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
