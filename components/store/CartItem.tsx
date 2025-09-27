"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItem as CartItemType } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";

interface CartItemProps {
	item: CartItemType;
	className?: string;
}

export function CartItem({ item, className }: CartItemProps) {
	const { updateQuantity, removeFromCart } = useCart();
	const { product, quantity } = item;

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity <= 0) {
			removeFromCart(product.id);
		} else {
			updateQuantity(product.id, newQuantity);
		}
	};

	const total = product.price * quantity;

	return (
		<div className={`flex gap-4 py-4 ${className}`}>
			{/* Product Image */}
			<div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
				<Link href={`/services/store/products/${product.id}`}>
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-cover"
						sizes="64px"
					/>
				</Link>
			</div>

			{/* Product Details */}
			<div className="flex-1 min-w-0">
				<div className="flex justify-between items-start mb-2">
					<div className="flex-1 min-w-0">
						<Link href={`/services/store/products/${product.id}`}>
							<h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
								{product.name}
							</h3>
						</Link>
						<Badge variant="secondary" className="mt-1 text-xs capitalize">
							{product.joint === "general"
								? "All Purpose"
								: `${product.joint} Support`}
						</Badge>
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-destructive"
						onClick={() => removeFromCart(product.id)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>

				{/* Price and Quantity */}
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-primary">
							{product.price.toFixed(2)} EGP
						</span>
						{product.originalPrice && (
							<span className="text-xs text-muted-foreground line-through">
								{product.originalPrice.toFixed(2)} EGP
							</span>
						)}
					</div>

					{/* Quantity Controls */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-7 w-7"
							onClick={() => handleQuantityChange(quantity - 1)}
						>
							<Minus className="h-3 w-3" />
						</Button>

						<span className="w-8 text-center text-sm font-medium">
							{quantity}
						</span>

						<Button
							variant="outline"
							size="icon"
							className="h-7 w-7"
							onClick={() => handleQuantityChange(quantity + 1)}
						>
							<Plus className="h-3 w-3" />
						</Button>
					</div>
				</div>

				{/* Item Total */}
				<div className="flex justify-between items-center mt-2">
					<div className="text-xs text-muted-foreground">
						{quantity} × {product.price.toFixed(2)} EGP
					</div>
					<div className="font-semibold">{total.toFixed(2)} EGP</div>
				</div>
			</div>
		</div>
	);
}
