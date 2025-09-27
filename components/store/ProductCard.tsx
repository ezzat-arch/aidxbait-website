"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";
import { useState } from "react";

interface ProductCardProps {
	product: Product;
	className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
	const { addToCart } = useCart();
	const [isLiked, setIsLiked] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!product.inStock) return;

		setIsLoading(true);
		addToCart(product);

		// Simulate a brief loading state for better UX
		setTimeout(() => {
			setIsLoading(false);
		}, 300);
	};

	const handleToggleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsLiked(!isLiked);
	};

	const discountPercentage = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100
		  )
		: 0;

	return (
		<Card
			className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
		>
			<div className="relative aspect-square overflow-hidden">
				<Link href={`/services/store/products/${product.id}`}>
					<Image
						src={product.image}
						alt={product.name}
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
					/>
				</Link>

				{/* Discount Badge */}
				{discountPercentage > 0 && (
					<Badge variant="destructive" className="absolute top-2 left-2 z-10">
						-{discountPercentage}%
					</Badge>
				)}

				{/* Stock Status */}
				{!product.inStock && (
					<Badge
						variant="outline"
						className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
					>
						Out of Stock
					</Badge>
				)}

				{/* Like Button */}
				<Button
					variant="ghost"
					size="icon"
					className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-colors ${
						!product.inStock ? "top-10 right-2" : ""
					} ${
						isLiked
							? "text-red-500"
							: "text-muted-foreground hover:text-red-500"
					}`}
					onClick={handleToggleLike}
				>
					<Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
				</Button>

				{/* Quick Add to Cart */}
				<div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<Button
						onClick={handleAddToCart}
						disabled={!product.inStock || isLoading}
						className="w-full"
						size="sm"
					>
						<ShoppingCart className="h-4 w-4 mr-2" />
						{isLoading ? "Adding..." : "Quick Add"}
					</Button>
				</div>
			</div>

			<CardContent className="p-4">
				<Link href={`/services/store/products/${product.id}`}>
					{/* Joint Badge */}
					<Badge variant="secondary" className="mb-2 capitalize">
						{product.joint === "general"
							? "All Purpose"
							: `${product.joint} Support`}
					</Badge>

					{/* Product Name */}
					<h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
						{product.name}
					</h3>

					{/* Rating */}
					<div className="flex items-center gap-1 mb-2">
						<div className="flex items-center">
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									className={`h-4 w-4 ${
										i < Math.floor(product.rating)
											? "text-yellow-400 fill-current"
											: "text-gray-300"
									}`}
								/>
							))}
						</div>
						<span className="text-sm text-muted-foreground">
							{product.rating} ({product.reviewCount})
						</span>
					</div>

					{/* Description */}
					<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
						{product.description}
					</p>
				</Link>
			</CardContent>

			<CardFooter className="p-4 pt-0 flex justify-between items-center">
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="text-lg font-bold text-primary">
							{product.price.toFixed(2)} EGP
						</span>
						{product.originalPrice && (
							<span className="text-sm text-muted-foreground line-through">
								{product.originalPrice.toFixed(2)} EGP
							</span>
						)}
					</div>
					{product.inStock && product.stockCount <= 5 && (
						<span className="text-xs text-amber-600">
							Only {product.stockCount} left
						</span>
					)}
				</div>

				<Button
					onClick={handleAddToCart}
					disabled={!product.inStock || isLoading}
					size="sm"
				>
					<ShoppingCart className="h-4 w-4 mr-2" />
					{isLoading ? "Adding..." : "Add to Cart"}
				</Button>
			</CardFooter>
		</Card>
	);
}
