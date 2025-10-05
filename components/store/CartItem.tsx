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

	// Compute derived values
	const effectivePrice = product.discounted_price || product.price;
	const hasDiscount = !!product.discounted_price;
	const mainImage =
		product.images.find((img) => img.is_main)?.image_url ||
		product.images[0]?.image_url ||
		"/placeholder.jpg";
	const primaryJoint = product.joints[0]?.joint_name || "general";

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity <= 0) {
			removeFromCart(product.id);
		} else {
			updateQuantity(product.id, newQuantity);
		}
	};

	const total = effectivePrice * quantity;

	return (
		<div className={`flex gap-4 py-4 ${className}`}>
			{/* Product Image */}
			<div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
				<Link href={`/services/store/products/${product.id}`}>
					<Image
						src={mainImage}
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
						<div className="mt-1 flex flex-wrap gap-1">
							{product.joints.slice(0, 2).map((joint) => (
								<Badge
									key={joint.joint_id}
									variant="secondary"
									className="text-xs capitalize"
								>
									{joint.joint_name === "general"
										? "All Purpose"
										: joint.joint_name}
								</Badge>
							))}
						</div>
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
							{effectivePrice.toFixed(2)} {product.currency}
						</span>
						{hasDiscount && (
							<span className="text-xs text-muted-foreground line-through">
								{product.price.toFixed(2)} {product.currency}
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
							disabled={quantity >= product.stock}
						>
							<Plus className="h-3 w-3" />
						</Button>
					</div>
				</div>

				{/* Item Total */}
				<div className="flex justify-between items-center mt-2">
					<div className="text-xs text-muted-foreground">
						{quantity} × {effectivePrice.toFixed(2)} {product.currency}
					</div>
					<div className="font-semibold">
						{total.toFixed(2)} {product.currency}
					</div>
				</div>
			</div>
		</div>
	);
}
