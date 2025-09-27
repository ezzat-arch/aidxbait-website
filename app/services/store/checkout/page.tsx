"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
	ArrowLeft,
	Lock,
	CreditCard,
	MapPin,
	User,
	Mail,
	Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { useCart } from "@/contexts/cart-context";
import { CartItem } from "@/components/store/CartItem";
import { CartSummary } from "@/components/store/CartSummary";
import { CheckoutFormData } from "@/lib/store-types";

export default function CheckoutPage() {
	const router = useRouter();
	const { cart, clearCart } = useCart();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [step, setStep] = useState<"form" | "success">("form");

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<CheckoutFormData>();

	// Redirect if cart is empty
	useEffect(() => {
		if (cart.items.length === 0 && step === "form") {
			router.push("/services/store");
		}
	}, [cart.items.length, router, step]);

	const onSubmit = async (data: CheckoutFormData) => {
		setIsSubmitting(true);

		// Simulate order processing
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Clear cart and show success
		clearCart();
		setStep("success");
		setIsSubmitting(false);
	};

	if (cart.items.length === 0 && step === "form") {
		return (
			<div className="min-h-screen bg-background pt-20">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
						<p className="text-muted-foreground mb-6">
							Add some products to proceed to checkout
						</p>
						<Button asChild>
							<Link href="/services/store">Continue Shopping</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (step === "success") {
		return (
			<div className="min-h-screen bg-background pt-20">
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg
								className="w-8 h-8 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
						<p className="text-muted-foreground mb-8">
							Thank you for your order. We'll send you a confirmation email with
							tracking information once your order ships.
						</p>
						<div className="space-y-4">
							<Button asChild size="lg">
								<Link href="/services/store">Continue Shopping</Link>
							</Button>
							<div>
								<Button variant="outline" asChild>
									<Link href="/">Return to Home</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const subtotal = cart.total;
	const shipping = subtotal > 50 ? 0 : 9.99;
	const tax = subtotal * 0.08;
	const total = subtotal + shipping + tax;

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
						<p className="text-muted-foreground">Complete your order below</p>
					</div>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Checkout Form */}
						<div className="lg:col-span-2 space-y-6">
							{/* Contact Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Mail className="h-5 w-5" />
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="email">Email Address</Label>
										<Input
											id="email"
											type="email"
											placeholder="your@email.com"
											{...register("email", {
												required: "Email is required",
												pattern: {
													value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
													message: "Invalid email address",
												},
											})}
										/>
										{errors.email && (
											<p className="text-sm text-destructive mt-1">
												{errors.email.message}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="phone">Phone Number</Label>
										<Input
											id="phone"
											type="tel"
											placeholder="(555) 123-4567"
											{...register("phone", {
												required: "Phone number is required",
											})}
										/>
										{errors.phone && (
											<p className="text-sm text-destructive mt-1">
												{errors.phone.message}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Personal Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="h-5 w-5" />
										Personal Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="firstName">First Name</Label>
											<Input
												id="firstName"
												placeholder="John"
												{...register("firstName", {
													required: "First name is required",
												})}
											/>
											{errors.firstName && (
												<p className="text-sm text-destructive mt-1">
													{errors.firstName.message}
												</p>
											)}
										</div>

										<div>
											<Label htmlFor="lastName">Last Name</Label>
											<Input
												id="lastName"
												placeholder="Doe"
												{...register("lastName", {
													required: "Last name is required",
												})}
											/>
											{errors.lastName && (
												<p className="text-sm text-destructive mt-1">
													{errors.lastName.message}
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Shipping Address */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="h-5 w-5" />
										Shipping Address
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label htmlFor="address">Address</Label>
										<Input
											id="address"
											placeholder="123 Main Street"
											{...register("address", {
												required: "Address is required",
											})}
										/>
										{errors.address && (
											<p className="text-sm text-destructive mt-1">
												{errors.address.message}
											</p>
										)}
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<Label htmlFor="city">City</Label>
											<Input
												id="city"
												placeholder="New York"
												{...register("city", {
													required: "City is required",
												})}
											/>
											{errors.city && (
												<p className="text-sm text-destructive mt-1">
													{errors.city.message}
												</p>
											)}
										</div>

										<div>
											<Label htmlFor="state">State</Label>
											<Input
												id="state"
												placeholder="NY"
												{...register("state", {
													required: "State is required",
												})}
											/>
											{errors.state && (
												<p className="text-sm text-destructive mt-1">
													{errors.state.message}
												</p>
											)}
										</div>

										<div>
											<Label htmlFor="zipCode">ZIP Code</Label>
											<Input
												id="zipCode"
												placeholder="10001"
												{...register("zipCode", {
													required: "ZIP code is required",
												})}
											/>
											{errors.zipCode && (
												<p className="text-sm text-destructive mt-1">
													{errors.zipCode.message}
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Payment Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CreditCard className="h-5 w-5" />
										Payment Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="bg-muted/50 p-4 rounded-lg">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Lock className="h-4 w-4" />
											<span className="text-sm">
												Payment processing is currently disabled for demo
												purposes. Your order will be processed without charging
												any payment method.
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Order Summary */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{cart.items.map((item, index) => (
											<div key={item.product.id}>
												<CartItem item={item} className="py-2" />
												{index < cart.items.length - 1 && <Separator />}
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="pt-6">
									<CartSummary cart={cart} />

									<Separator className="my-4" />

									<Button
										type="submit"
										className="w-full"
										size="lg"
										disabled={isSubmitting}
									>
										<Lock className="h-4 w-4 mr-2" />
										{isSubmitting
											? "Processing..."
											: `Complete Order - ${total.toFixed(2)} EGP`}
									</Button>

									<p className="text-xs text-muted-foreground text-center mt-3">
										By completing your order, you agree to our Terms of Service
										and Privacy Policy
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
