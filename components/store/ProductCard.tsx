"use client";

import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "@/i18n/navigation";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/types/i18n";
import {
	getLocalizedProductName,
	getLocalizedProductDescription,
	getLocalizedJointName,
} from "@/lib/i18n/data-utils";
import { getDisplayCurrency } from "@/lib/i18n/utils";

interface ProductCardProps {
	product: Product;
	className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
	const { addToCart } = useCart();
	const locale = useLocale() as Locale;
	const t = useTranslations("store.ProductCard.text");
	const router = useRouter();
	const [isLiked, setIsLiked] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [rentalWeeks, setRentalWeeks] = useState(1);

	const productUrl = `/services/store/products/${product.id}`;

	const handleCardClick = () => {
		router.push(productUrl);
	};

	// Get localized product fields
	const productName = getLocalizedProductName(product, locale);
	const productDescription = getLocalizedProductDescription(product, locale);

	// Compute derived values from new product structure
	const isInStock =
		product.is_available && !product.is_oos && product.stock > 0;
	const effectivePrice = product.discounted_price || product.price;
	const hasDiscount = !!product.discounted_price;
	const discountPercentage = hasDiscount
		? Math.round(
				((product.price - product.discounted_price!) / product.price) * 100
		  )
		: 0;
	const mainImage =
		product.images.find((img) => img.is_main)?.image_url ||
		product.images[0]?.image_url ||
		"/placeholder.jpg";
	const primaryJoint = product.joints[0]
		? getLocalizedJointName(product.joints[0], locale)
		: "general";

	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isInStock) return;

		setIsLoading(true);
		// Pass rental weeks if product is for rent
		addToCart(product, 1, product.is_for_rent ? rentalWeeks : undefined);

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

	return (
		<Card
			className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
		>
			{/* Full card clickable overlay */}
			<NextLink
				href={productUrl}
				className="absolute inset-0 z-[1]"
				aria-label={productName}
			/>
			<div className="relative aspect-square overflow-hidden">
				<Image
					src={mainImage}
					alt={productName}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
					sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
				/>

				{/* Badges */}
				<div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
					{/* Discount Badge */}
					{hasDiscount && (
						<Badge variant="destructive">-{discountPercentage}%</Badge>
					)}
					{/* Best Seller Badge */}
					{product.is_best_seller && (
						<Badge className="bg-amber-500 hover:bg-amber-600">
							{t("best_seller")}
						</Badge>
					)}
					{/* Featured Badge */}
					{product.is_featured && (
						<Badge className="bg-purple-500 hover:bg-purple-600">
							{t("featured")}
						</Badge>
					)}
					{/* For Rent Badge */}
					{product.is_for_rent && (
						<Badge
							variant="outline"
							className="bg-background/80 backdrop-blur-sm"
						>
							{t("for_rent")}
						</Badge>
					)}
				</div>

				{/* Stock Status */}
				{!isInStock && (
					<Badge
						variant="outline"
						className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
					>
						{t("out_of_stock")}
					</Badge>
				)}

				{/* Like Button */}
				<Button
					variant="ghost"
					size="icon"
					className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-colors ${
						!isInStock ? "top-10 right-2" : ""
					} ${
						isLiked
							? "text-red-500"
							: "text-muted-foreground hover:text-red-500"
					}`}
					onClick={handleToggleLike}
				>
					<Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
				</Button>
			</div>

			<CardContent className="p-4 relative">
				{/* Joint Badges */}
				<div className="mb-2 flex flex-wrap gap-1">
					{product.joints.slice(0, 2).map((joint) => (
						<Badge
							key={joint.joint_id}
							variant="secondary"
							className="capitalize"
						>
							{joint.joint_name === "general"
								? t("all_purpose")
								: getLocalizedJointName(joint, locale)}
						</Badge>
					))}
					{product.joints.length > 2 && (
						<Badge variant="outline" className="text-xs">
							+{product.joints.length - 2}
						</Badge>
					)}
				</div>

				{/* Product Name */}
				<h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
					{productName}
				</h3>

				{/* Rating */}
				{product.reviewCount > 0 && (
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
							{product.rating.toFixed(1)} ({product.reviewCount})
						</span>
					</div>
				)}

				{/* Description */}
				<p className="text-sm text-muted-foreground line-clamp-2 mb-3">
					{productDescription || t("no_description_available")}
				</p>
			</CardContent>

			<CardFooter className="p-4 pt-0 flex flex-col gap-3 relative z-10">
				<div className="flex justify-between items-center w-full">
					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<span className="text-lg font-bold text-primary">
								{effectivePrice.toFixed(2)}{" "}
								{getDisplayCurrency(locale)}
							</span>
							{hasDiscount && (
								<span className="text-sm text-muted-foreground line-through">
									{product.price.toFixed(2)}{" "}
									{getDisplayCurrency(locale)}
								</span>
							)}
						</div>
						{isInStock && product.stock <= 5 && (
							<span className="text-xs text-amber-600">
								{t("only_x_left", { count: product.stock })}
							</span>
						)}
						{product.is_for_rent && product.rent_term && (
							<span className="text-xs text-muted-foreground capitalize">
								{product.rent_term.replace(
									"per_",
									locale === "ar" ? " / " : " / "
								)}
							</span>
						)}
					</div>

					<Button
						onClick={handleAddToCart}
						disabled={!isInStock || isLoading}
						size="sm"
					>
						<ShoppingCart className="h-4 w-4 mr-2" />
						{isLoading ? t("adding") : t("add")}
					</Button>
				</div>

				{/* Rental Weeks Input */}
				{product.is_for_rent && isInStock && (
					<div className="flex items-center gap-2 w-full">
						<label
							htmlFor={`rental-weeks-${product.id}`}
							className="text-sm font-medium text-muted-foreground whitespace-nowrap"
						>
							{t("rental_period")}
						</label>
						<input
							id={`rental-weeks-${product.id}`}
							type="number"
							min="1"
							max="52"
							value={rentalWeeks}
							onChange={(e) =>
								setRentalWeeks(Math.max(1, parseInt(e.target.value) || 1))
							}
							onClick={(e) => e.stopPropagation()}
							className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
						<span className="text-sm text-muted-foreground">
							{rentalWeeks === 1 ? t("week") : t("weeks")}
						</span>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
