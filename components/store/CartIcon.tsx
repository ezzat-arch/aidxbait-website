"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";

export function CartIcon() {
	const { cart, toggleCart } = useCart();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="relative"
			onClick={toggleCart}
		>
			<ShoppingCart className="h-5 w-5" />
			{cart.itemCount > 0 && (
				<Badge
					variant="destructive"
					className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
				>
					{cart.itemCount > 99 ? "99+" : cart.itemCount}
				</Badge>
			)}
		</Button>
	);
}
