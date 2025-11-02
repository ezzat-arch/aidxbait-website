"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { eventService } from "@/lib/tracking/event-service";

export default function CheckoutPage() {
	const router = useRouter();
	const { cart, clearCart } = useCart();
	const { user, userProfile, loading: authLoading, profileLoading } = useAuth();

	// DEBUG: Log component mount
	useEffect(() => {
		console.log(
			"[CHECKOUT-DEBUG] Component mounted at",
			new Date().toISOString()
		);
		console.log("[CHECKOUT-DEBUG] Initial state:", {
			authLoading,
			profileLoading,
			hasUser: !!user,
			hasUserProfile: !!userProfile,
			patientId: userProfile?.patient_id,
			cartItemCount: cart.items.length,
		});
	}, []);

	const [addresses, setAddresses] = useState<PatientAddress[]>([]);
	const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
		null
	);
	const [paymentMethod, setPaymentMethod] =
		useState<PaymentMethod>("cash_on_delivery");

	// Track payment method selection
	const handlePaymentMethodChange = (method: PaymentMethod) => {
		setPaymentMethod(method);
		eventService.trackCheckoutEvent("payment_method_selected", {
			cartValue: cart.total,
			cartItemCount: cart.itemCount,
			paymentMethod: method,
		});
	};
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingAddresses, setLoadingAddresses] = useState(false);

	// Ref to track if checkout events have been handled
	const hasHandledCheckoutStart = useRef(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		console.log("[CHECKOUT-DEBUG] Auth redirect effect triggered:", {
			authLoading,
			hasUser: !!user,
			timestamp: new Date().toISOString(),
		});

		if (!authLoading && !user) {
			console.log("[CHECKOUT-DEBUG] Redirecting to login - no user found");
			router.push(
				`/login?redirect=${encodeURIComponent("/services/store/checkout")}`
			);
		}
	}, [user, authLoading, router]);

	// Track checkout started and redirect to store if cart is empty
	useEffect(() => {
		console.log("[CHECKOUT-DEBUG] Checkout start effect triggered:", {
			authLoading,
			profileLoading,
			hasHandledCheckoutStart: hasHandledCheckoutStart.current,
			cartItemsLength: cart.items.length,
			timestamp: new Date().toISOString(),
		});

		if (!authLoading && !profileLoading && !hasHandledCheckoutStart.current) {
			if (cart.items.length === 0) {
				console.log("[CHECKOUT-DEBUG] Redirecting to store - empty cart");
				router.push("/services/store");
			} else {
				console.log("[CHECKOUT-DEBUG] Checkout started - tracking event");
				hasHandledCheckoutStart.current = true;
				// Track checkout started
				eventService.trackCheckoutEvent("started", {
					cartValue: cart.total,
					cartItemCount: cart.itemCount,
				});

				// Create cart snapshot for abandonment tracking
				eventService.createCartSnapshot(cart.items, cart.total);
			}
		}
	}, [
		authLoading,
		profileLoading,
		cart.items,
		cart.total,
		cart.itemCount,
		router,
	]);

	// Load addresses - memoized with useCallback
	const loadAddresses = useCallback(async () => {
		const startTime = Date.now();
		console.log("[CHECKOUT-DEBUG] loadAddresses called:", {
			patientId: userProfile?.patient_id,
			timestamp: new Date().toISOString(),
		});

		if (!userProfile?.patient_id) {
			console.log("[CHECKOUT-DEBUG] loadAddresses skipped - no patient_id");
			return;
		}

		try {
			console.log("[CHECKOUT-DEBUG] Setting loadingAddresses to true");
			setLoadingAddresses(true);

			console.log("[CHECKOUT-DEBUG] Fetching addresses from API...");
			const data = await fetchAddresses(userProfile.patient_id);
			const fetchDuration = Date.now() - startTime;

			console.log("[CHECKOUT-DEBUG] Addresses fetched successfully:", {
				addressCount: data.length,
				fetchDurationMs: fetchDuration,
				timestamp: new Date().toISOString(),
			});

			setAddresses(data);

			// Auto-select primary address
			const primaryAddress = data.find((addr) => addr.is_primary);
			if (primaryAddress) {
				console.log(
					"[CHECKOUT-DEBUG] Auto-selecting primary address:",
					primaryAddress.id
				);
				setSelectedAddressId(primaryAddress.id);
				// Track address selected
				eventService.trackCheckoutEvent("address_selected", {
					cartValue: cart.total,
					cartItemCount: cart.itemCount,
				});
			} else if (data.length > 0) {
				console.log(
					"[CHECKOUT-DEBUG] Auto-selecting first address:",
					data[0].id
				);
				setSelectedAddressId(data[0].id);
				// Track address selected
				eventService.trackCheckoutEvent("address_selected", {
					cartValue: cart.total,
					cartItemCount: cart.itemCount,
				});
			} else {
				console.log("[CHECKOUT-DEBUG] No addresses found to auto-select");
			}
		} catch (error) {
			const fetchDuration = Date.now() - startTime;
			console.error("[CHECKOUT-DEBUG] Error loading addresses:", {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				patientId: userProfile?.patient_id,
				fetchDurationMs: fetchDuration,
				timestamp: new Date().toISOString(),
			});
			toast({
				title: "Error",
				description: "Failed to load addresses. Please try again.",
				variant: "destructive",
			});
		} finally {
			console.log("[CHECKOUT-DEBUG] Setting loadingAddresses to false");
			setLoadingAddresses(false);
		}
	}, [userProfile?.patient_id, cart.total, cart.itemCount]);

	// Load addresses when user profile is available
	useEffect(() => {
		console.log("[CHECKOUT-DEBUG] Load addresses effect triggered:", {
			hasUserProfile: !!userProfile,
			patientId: userProfile?.patient_id,
			timestamp: new Date().toISOString(),
		});

		if (userProfile) {
			if (userProfile.patient_id) {
				console.log("[CHECKOUT-DEBUG] Calling loadAddresses()");
				loadAddresses();
			} else {
				console.log(
					"[CHECKOUT-DEBUG] No patient_id - setting loadingAddresses to false"
				);
				// No patient_id - user profile exists but is incomplete
				setLoadingAddresses(false);
			}
		} else {
			console.log("[CHECKOUT-DEBUG] No userProfile yet - waiting");
		}
	}, [userProfile, loadAddresses]);

	const handlePlaceOrder = async () => {
		// Prevent duplicate submissions
		if (isSubmitting) {
			return;
		}

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

			// Track order submission
			eventService.trackCheckoutEvent("order_submitted", {
				cartValue: cart.total,
				cartItemCount: cart.itemCount,
				paymentMethod,
			});

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

			// Handle based on payment method
			if (paymentMethod === "online") {
				// For online payment, create payment intention and redirect to Paymob
				try {
					// Track payment initiated
					eventService.trackCheckoutEvent("payment_initiated", {
						orderId: order.id,
						cartValue: cart.total,
						cartItemCount: cart.itemCount,
						paymentMethod: "online",
					});

					const response = await fetch(
						"/api/payments/paymob/create-intention",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ order_id: order.id }),
						}
					);

					const data = await response.json();

					if (!response.ok || !data.success) {
						// Track payment failure
						eventService.trackCheckoutEvent("payment_failed", {
							orderId: order.id,
							cartValue: cart.total,
							cartItemCount: cart.itemCount,
							paymentMethod: "online",
							failureReason: data.error || "Failed to create payment intention",
						});

						throw new Error(data.error || "Failed to create payment intention");
					}

					// Clear cart before redirecting to payment gateway
					// This ensures client and server are both cleared when order is created
					await clearCart();

					// Redirect to Paymob payment page
					window.location.href = data.payment_url;
				} catch (paymentError) {
					console.error("Error creating payment:", paymentError);
					toast({
						title: "Payment Error",
						description:
							paymentError instanceof Error
								? paymentError.message
								: "Failed to initialize payment. Please try again.",
						variant: "destructive",
					});
					setIsSubmitting(false);
				}
			} else {
				// For cash on delivery, track completion, clear cart and redirect
				eventService.trackCheckoutEvent("payment_completed", {
					orderId: order.id,
					cartValue: cart.total,
					cartItemCount: cart.itemCount,
					paymentMethod: "cash_on_delivery",
				});

				await clearCart();

				toast({
					title: "Order Placed!",
					description: "Your order has been placed successfully.",
				});

				router.push(`/profile/my-orders/${order.id}`);
			}
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
			setIsSubmitting(false);
		}
	};

	// Calculate order totals
	const orderCalculation = calculateOrderTotals(cart.total);

	// DEBUG: Log loading state changes
	useEffect(() => {
		console.log("[CHECKOUT-DEBUG] Loading states changed:", {
			authLoading,
			profileLoading,
			loadingAddresses,
			isBlocked: authLoading || profileLoading || loadingAddresses,
			timestamp: new Date().toISOString(),
		});
	}, [authLoading, profileLoading, loadingAddresses]);

	if (authLoading || profileLoading || loadingAddresses) {
		console.log("[CHECKOUT-DEBUG] Rendering loading screen:", {
			authLoading,
			profileLoading,
			loadingAddresses,
			timestamp: new Date().toISOString(),
		});

		return (
			<div className="min-h-screen bg-background pt-28 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	console.log("[CHECKOUT-DEBUG] Rendering checkout page content");

	if (!user || cart.items.length === 0) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background pt-28">
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
									onSelectMethod={handlePaymentMethodChange}
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
