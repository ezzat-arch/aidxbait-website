"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { CartItem } from "@/components/store/CartItem";
import { AddressSelector } from "@/components/store/checkout/AddressSelector";
import { QuickAddressAdd } from "@/components/store/checkout/QuickAddressAdd";
import { PaymentMethodSelector } from "@/components/store/checkout/PaymentMethodSelector";
import { OrderSummaryCheckout } from "@/components/store/checkout/OrderSummaryCheckout";
import { fetchAddresses } from "@/lib/addresses/address-service";
import { createOrder, calculateOrderTotals } from "@/lib/orders/order-service";
import {
	PatientAddress,
	PaymentMethod,
	CreateOrderItemRequest,
} from "@/lib/order-types";
import { toast } from "@/hooks/use-toast";

export default function CheckoutPage() {
	const router = useRouter();
	const { cart, clearCart } = useCart();
	const { user, userProfile, loading: authLoading } = useAuth();

	const [addresses, setAddresses] = useState<PatientAddress[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
		null
	);
	const [paymentMethod, setPaymentMethod] =
		useState<PaymentMethod>("cash_on_delivery");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingAddresses, setLoadingAddresses] = useState(true);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !user) {
			router.push(
				`/login?redirect=${encodeURIComponent("/services/store/checkout")}`
			);
		}
	}, [user, authLoading, router]);

	// Redirect to store if cart is empty
	useEffect(() => {
		if (!authLoading && cart.items.length === 0) {
			router.push("/services/store");
		}
	}, [cart.items.length, authLoading, router]);

	// Load addresses
	useEffect(() => {
		if (userProfile?.patient_id) {
			loadAddresses();
		}
	}, [userProfile?.patient_id]);

	const loadAddresses = async () => {
		if (!userProfile?.patient_id) return;

		try {
			setLoadingAddresses(true);
			const data = await fetchAddresses(userProfile.patient_id);
			setAddresses(data);

			// Auto-select primary address
			const primaryAddress = data.find((addr) => addr.is_primary);
			if (primaryAddress) {
				setSelectedAddressId(primaryAddress.id);
			} else if (data.length > 0) {
				setSelectedAddressId(data[0].id);
			}
		} catch (error) {
			console.error("Error loading addresses:", error);
			toast({
				title: "Error",
				description: "Failed to load addresses. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoadingAddresses(false);
		}
	};

	const handlePlaceOrder = async () => {
		if (!userProfile?.patient_id) {
			toast({
				title: "Error",
				description: "User information not available. Please log in again.",
				variant: "destructive",
			});
			return;
		}

		if (!selectedAddressId) {
			toast({
				title: "Address Required",
				description: "Please select a shipping address.",
				variant: "destructive",
			});
			return;
		}

		if (cart.items.length === 0) {
			toast({
				title: "Empty Cart",
				description: "Your cart is empty.",
				variant: "destructive",
			});
			return;
		}

		try {
			setIsSubmitting(true);

			// Prepare order items with rental dates
			const now = new Date();
			const orderItems: CreateOrderItemRequest[] = cart.items.map((item) => {
				const orderItem: CreateOrderItemRequest = {
					product_id: item.product.id,
					quantity: item.quantity,
				};

				// Add rental dates for rental products
				if (item.product.is_for_rent && item.rental_weeks) {
					const startDate = new Date(now);
					const endDate = new Date(now);
					endDate.setDate(endDate.getDate() + item.rental_weeks * 7);

					// Emit DATE strings (YYYY-MM-DD) to align with DB DATE columns
					orderItem.rental_start_date = startDate.toISOString().slice(0, 10);
					orderItem.rental_end_date = endDate.toISOString().slice(0, 10);
				}

				return orderItem;
			});

			// Create the order
			const order = await createOrder({
				patient_id: userProfile.patient_id,
				items: orderItems,
				shipping_address_id: selectedAddressId,
				payment_method: paymentMethod,
			});

			// Clear cart and redirect to order confirmation
			clearCart();

			toast({
				title: "Order Placed!",
				description: "Your order has been placed successfully.",
			});

			router.push(`/profile/my-orders/${order.id}`);
		} catch (error) {
			console.error("Error placing order:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to place order. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Calculate order totals
	const orderCalculation = calculateOrderTotals(cart.total);

	if (authLoading || loadingAddresses) {
		return (
			<div className="min-h-screen bg-background pt-20 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (!user || cart.items.length === 0) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-8">
					<Button variant="ghost" asChild className="-ml-4">
						<Link href="/services/store">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Store
						</Link>
					</Button>
					<div>
						<h1 className="text-3xl font-bold">Checkout</h1>
						<p className="text-muted-foreground">Complete your order</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Checkout Form */}
					<div className="lg:col-span-2 space-y-6">
						{/* Shipping Address */}
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>Shipping Address</CardTitle>
									{userProfile?.patient_id && (
										<QuickAddressAdd
											patientId={userProfile.patient_id}
											onAddressAdded={loadAddresses}
										/>
									)}
								</div>
							</CardHeader>
							<CardContent>
								{addresses.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-muted-foreground mb-4">
											You don't have any saved addresses yet.
										</p>
										{userProfile?.patient_id && (
											<QuickAddressAdd
												patientId={userProfile.patient_id}
												onAddressAdded={loadAddresses}
											/>
										)}
									</div>
								) : (
									<AddressSelector
										addresses={addresses}
										selectedAddressId={selectedAddressId}
										onSelectAddress={setSelectedAddressId}
									/>
								)}
							</CardContent>
						</Card>

						{/* Payment Method */}
						<Card>
							<CardHeader>
								<CardTitle>Payment Method</CardTitle>
							</CardHeader>
							<CardContent>
								<PaymentMethodSelector
									selectedMethod={paymentMethod}
									onSelectMethod={setPaymentMethod}
								/>
							</CardContent>
						</Card>

						{/* Order Items */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ShoppingBag className="h-5 w-5" />
									Order Items ({cart.itemCount})
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{cart.items.map((item, index) => (
										<div key={item.product.id}>
											<CartItem item={item} />
											{index < cart.items.length - 1 && (
												<Separator className="my-4" />
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Order Summary Sidebar */}
					<div className="space-y-6">
						<OrderSummaryCheckout calculation={orderCalculation} />

						<Button
							onClick={handlePlaceOrder}
							disabled={
								isSubmitting || !selectedAddressId || addresses.length === 0
							}
							className="w-full"
							size="lg"
						>
							<Lock className="h-4 w-4 mr-2" />
							{isSubmitting
								? "Placing Order..."
								: `Place Order - ${orderCalculation.total.toFixed(2)} EGP`}
						</Button>

						<p className="text-xs text-muted-foreground text-center">
							By placing your order, you agree to our Terms of Service and
							Privacy Policy
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
