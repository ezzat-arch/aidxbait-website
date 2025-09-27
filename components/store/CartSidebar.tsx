"use client";

import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/cart-context";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import Link from "next/link";

export function CartSidebar() {
	const { cart, isCartOpen, closeCart, clearCart } = useCart();

	const isEmpty = cart.items.length === 0;

	return (
		<Sheet open={isCartOpen} onOpenChange={closeCart}>
			<SheetContent className="flex flex-col w-full sm:max-w-lg">
				<SheetHeader className="space-y-2.5 pr-6">
					<SheetTitle className="flex items-center gap-2">
						<ShoppingBag className="h-5 w-5" />
						Shopping Cart ({cart.itemCount})
					</SheetTitle>
					{!isEmpty && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearCart}
							className="w-fit text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Clear All
						</Button>
					)}
				</SheetHeader>

				{isEmpty ? (
					<div className="flex flex-col items-center justify-center flex-1 py-8">
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
							<ShoppingBag className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
						<p className="text-muted-foreground text-center mb-6">
							Add some products to get started
						</p>
						<Button asChild onClick={closeCart}>
							<Link href="/services/store">Continue Shopping</Link>
						</Button>
					</div>
				) : (
					<>
						<ScrollArea className="flex-1 -mx-6 px-6">
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
						</ScrollArea>

						<div className="space-y-4 pt-4 border-t">
							<CartSummary cart={cart} />

							<div className="space-y-2">
								<Button asChild className="w-full" size="lg">
									<Link href="/services/store/checkout" onClick={closeCart}>
										Proceed to Checkout
									</Link>
								</Button>

								<Button
									variant="outline"
									className="w-full"
									onClick={closeCart}
									asChild
								>
									<Link href="/services/store">Continue Shopping</Link>
								</Button>
							</div>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
