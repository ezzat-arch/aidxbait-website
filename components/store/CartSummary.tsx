"use client";

import { Separator } from "@/components/ui/separator";
import { Cart } from "@/lib/store-types";

interface CartSummaryProps {
	cart: Cart;
	className?: string;
}

export function CartSummary({ cart, className }: CartSummaryProps) {
	const subtotal = cart.total;
	const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
	const tax = subtotal * 0.08; // 8% tax
	const total = subtotal + shipping + tax;

	return (
		<div className={`space-y-4 ${className}`}>
			<h3 className="font-semibold">Order Summary</h3>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>Subtotal ({cart.itemCount} items)</span>
					<span>{subtotal.toFixed(2)} EGP</span>
				</div>

				<div className="flex justify-between text-sm">
					<span>Shipping</span>
					<span>
						{shipping === 0 ? (
							<span className="text-green-600 font-medium">Free</span>
						) : (
							`${shipping.toFixed(2)} EGP`
						)}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span>Tax</span>
					<span>{tax.toFixed(2)} EGP</span>
				</div>

				{shipping > 0 && (
					<div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
						💡 Add {(50 - subtotal).toFixed(2)} EGP more for free shipping
					</div>
				)}
			</div>

			<Separator />

			<div className="flex justify-between font-semibold text-lg">
				<span>Total</span>
				<span>{total.toFixed(2)} EGP</span>
			</div>

			<div className="text-xs text-muted-foreground">
				Tax calculated at checkout. Final total may vary.
			</div>
		</div>
	);
}
