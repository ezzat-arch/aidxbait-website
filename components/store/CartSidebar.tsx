"use client";

import { useState } from "react";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
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
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "@/hooks/use-toast";
import { eventService } from "@/lib/tracking/event-service";

type CheckoutResponse = {
	success: boolean;
	data?: { checkoutUrl: string };
	error?: string;
};

export function CartSidebar() {
	const { cart, isCartOpen, closeCart, clearCart } = useCart();
	const t = useTranslations("store.CartSidebar.text");
	const tStore = useTranslations("store.StoreShopifyContent");
	const locale = useLocale();
	const [isStartingCheckout, setIsStartingCheckout] = useState(false);

	const isEmpty = cart.items.length === 0;

	/**
	 * Straight to Shopify's hosted checkout, signed in or not. There is
	 * deliberately no login gate here: guests are a first-class path, and the
	 * server pre-fills the cart from the session when there is one.
	 */
	const handleProceedToCheckout = async () => {
		if (isEmpty || isStartingCheckout) return;
		setIsStartingCheckout(true);

		// Fire the funnel events before navigating away; both are best-effort and
		// must never stand between the buyer and checkout.
		eventService.trackCheckoutEvent("started", {
			cartValue: cart.total,
			cartItemCount: cart.itemCount,
		});
		void eventService.createCartSnapshot(cart.items, cart.total);

		try {
			// Trailing slash on purpose: `trailingSlash: true` in next.config.mjs
			// makes the un-slashed path a 308.
			const response = await fetch("/api/checkout/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					lines: cart.items.map((line) => ({
						merchandiseId: line.variantId,
						quantity: line.quantity,
					})),
					locale,
				}),
			});
			const result = (await response.json()) as CheckoutResponse;

			if (result.success && result.data?.checkoutUrl) {
				closeCart();
				window.location.href = result.data.checkoutUrl;
				return;
			}
			throw new Error(result.error ?? "Checkout was refused");
		} catch (error) {
			// ponytail: a sold-out line comes back as one generic message. Shopify's
			// `userErrors[].field` can pinpoint the line if that ever bites; surface
			// `data.unavailableLineIndexes` from the route then.
			console.error("[CartSidebar] Checkout failed:", error);
			toast({
				variant: "destructive",
				title: tStore("checkout_error"),
			});
			setIsStartingCheckout(false);
		}
	};

	return (
		<Sheet open={isCartOpen} onOpenChange={closeCart}>
			{/* The sheet slides in from the buyer's inline end, which is the left in Arabic. */}
			<SheetContent
				side={locale === "ar" ? "left" : "right"}
				className="flex flex-col w-full sm:max-w-lg"
			>
				<SheetHeader className="space-y-2.5 pe-6">
					<SheetTitle className="flex items-center gap-2">
						<ShoppingBag className="h-5 w-5" />
						{t("shopping_cart")} ({cart.itemCount})
					</SheetTitle>
					{!isEmpty && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearCart}
							className="w-fit text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-4 w-4 me-2" />
							{t("clear_all")}
						</Button>
					)}
				</SheetHeader>

				{isEmpty ? (
					<div className="flex flex-col items-center justify-center flex-1 py-8">
						<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
							<ShoppingBag className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="font-semibold text-lg mb-2">
							{t("your_cart_is_empty")}
						</h3>
						<p className="text-muted-foreground text-center mb-6">
							{t("add_some_products_to_get_started")}
						</p>
						<Button asChild onClick={closeCart}>
							<Link href="/services/store">{t("continue_shopping")}</Link>
						</Button>
					</div>
				) : (
					<>
						<ScrollArea className="flex-1 -mx-6 px-6">
							<div className="space-y-4">
								{cart.items.map((line, index) => (
									<div key={line.variantId}>
										<CartItem line={line} />
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
								<Button
									className="w-full"
									size="lg"
									onClick={handleProceedToCheckout}
									disabled={isStartingCheckout}
								>
									{isStartingCheckout && (
										<Loader2 className="me-2 h-4 w-4 animate-spin" />
									)}
									{t("proceed_to_checkout")}
								</Button>

								<Button
									variant="outline"
									className="w-full"
									onClick={closeCart}
									asChild
								>
									<Link href="/services/store">{t("continue_shopping")}</Link>
								</Button>
							</div>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
