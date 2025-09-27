"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Heart,
	Star,
	ShoppingCart,
	Plus,
	Minus,
	Check,
	Shield,
	Truck,
	RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DUMMY_PRODUCTS } from "@/lib/store-data";
import { useCart } from "@/contexts/cart-context";

interface ProductPageProps {
	params: {
		id: string;
	};
}

export default function ProductPage({ params }: ProductPageProps) {
	const product = DUMMY_PRODUCTS.find((p) => p.id === params.id);
	const { addToCart, openCart } = useCart();

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	if (!product) {
		notFound();
	}

	const handleAddToCart = async () => {
		if (!product.inStock) return;

		setIsLoading(true);
		addToCart(product, quantity);

		setTimeout(() => {
			setIsLoading(false);
			openCart();
		}, 300);
	};

	const handleBuyNow = async () => {
		if (!product.inStock) return;

		setIsLoading(true);
		addToCart(product, quantity);

		setTimeout(() => {
			setIsLoading(false);
			window.location.href = "/services/store/checkout";
		}, 300);
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= (product.stockCount || 99)) {
			setQuantity(newQuantity);
		}
	};

	const discountPercentage = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100
		  )
		: 0;

	const relatedProducts = DUMMY_PRODUCTS.filter(
		(p) => p.joint === product.joint && p.id !== product.id
	).slice(0, 4);

	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="container mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
					<Link href="/services/store" className="hover:text-primary">
						Store
					</Link>
					<span>/</span>
					<span className="capitalize">{product.joint}</span>
					<span>/</span>
					<span className="text-foreground">{product.name}</span>
				</div>

				{/* Back Button */}
				<Button variant="ghost" className="mb-6 -ml-4" asChild>
					<Link href="/services/store">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Store
					</Link>
				</Button>

				{/* Product Details */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
					{/* Product Images */}
					<div className="space-y-4">
						<div className="relative aspect-square overflow-hidden rounded-lg border">
							<Image
								src={product.images[selectedImageIndex]}
								alt={product.name}
								fill
								className="object-cover"
								priority
							/>
							{discountPercentage > 0 && (
								<Badge variant="destructive" className="absolute top-4 left-4">
									-{discountPercentage}%
								</Badge>
							)}
							{!product.inStock && (
								<Badge
									variant="outline"
									className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
								>
									Out of Stock
								</Badge>
							)}
						</div>

						{/* Image Thumbnails */}
						{product.images.length > 1 && (
							<div className="flex gap-2">
								{product.images.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImageIndex(index)}
										className={`relative w-20 h-20 rounded border-2 overflow-hidden ${
											selectedImageIndex === index
												? "border-primary"
												: "border-border"
										}`}
									>
										<Image
											src={image}
											alt={`${product.name} ${index + 1}`}
											fill
											className="object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Info */}
					<div className="space-y-6">
						<div>
							<Badge variant="secondary" className="mb-2 capitalize">
								{product.joint === "general"
									? "All Purpose"
									: `${product.joint} Support`}
							</Badge>

							<h1 className="text-3xl font-bold mb-4">{product.name}</h1>

							{/* Rating */}
							<div className="flex items-center gap-2 mb-4">
								<div className="flex items-center">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`h-5 w-5 ${
												i < Math.floor(product.rating)
													? "text-yellow-400 fill-current"
													: "text-gray-300"
											}`}
										/>
									))}
								</div>
								<span className="text-muted-foreground">
									{product.rating} ({product.reviewCount} reviews)
								</span>
							</div>

							{/* Price */}
							<div className="flex items-center gap-3 mb-6">
								<span className="text-3xl font-bold text-primary">
									{product.price.toFixed(2)} EGP
								</span>
								{product.originalPrice && (
									<span className="text-xl text-muted-foreground line-through">
										{product.originalPrice.toFixed(2)} EGP
									</span>
								)}
							</div>

							<p className="text-muted-foreground text-lg mb-6">
								{product.description}
							</p>
						</div>

						{/* Quantity and Actions */}
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="flex items-center border rounded-md">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleQuantityChange(quantity - 1)}
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="px-4 py-2 font-medium">{quantity}</span>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleQuantityChange(quantity + 1)}
										disabled={quantity >= (product.stockCount || 99)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>

								{product.inStock && product.stockCount <= 10 && (
									<span className="text-amber-600 text-sm">
										Only {product.stockCount} left in stock
									</span>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<Button
									onClick={handleBuyNow}
									disabled={!product.inStock || isLoading}
									size="lg"
									className="flex-1"
								>
									{isLoading ? "Processing..." : "Buy Now"}
								</Button>

								<Button
									variant="outline"
									onClick={handleAddToCart}
									disabled={!product.inStock || isLoading}
									size="lg"
									className="flex-1"
								>
									<ShoppingCart className="h-4 w-4 mr-2" />
									Add to Cart
								</Button>

								<Button
									variant="outline"
									size="lg"
									onClick={() => setIsLiked(!isLiked)}
									className={isLiked ? "text-red-500 border-red-200" : ""}
								>
									<Heart
										className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
									/>
								</Button>
							</div>
						</div>

						{/* Benefits */}
						<div className="grid grid-cols-3 gap-4 py-6 border-y">
							<div className="flex flex-col items-center text-center">
								<Shield className="h-6 w-6 text-primary mb-2" />
								<span className="text-sm font-medium">Quality Guaranteed</span>
							</div>
							<div className="flex flex-col items-center text-center">
								<Truck className="h-6 w-6 text-primary mb-2" />
								<span className="text-sm font-medium">Fast Shipping</span>
							</div>
							<div className="flex flex-col items-center text-center">
								<RotateCcw className="h-6 w-6 text-primary mb-2" />
								<span className="text-sm font-medium">Easy Returns</span>
							</div>
						</div>
					</div>
				</div>

				{/* Product Details Tabs */}
				<Tabs defaultValue="features" className="mb-16">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="features">Features</TabsTrigger>
						<TabsTrigger value="specifications">Specifications</TabsTrigger>
						<TabsTrigger value="reviews">Reviews</TabsTrigger>
					</TabsList>

					<TabsContent value="features" className="mt-6">
						<Card>
							<CardHeader>
								<CardTitle>Key Features</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2">
									{product.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-2">
											<Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="specifications" className="mt-6">
						<Card>
							<CardHeader>
								<CardTitle>Specifications</CardTitle>
							</CardHeader>
							<CardContent>
								<dl className="space-y-3">
									{Object.entries(product.specifications).map(
										([key, value]) => (
											<div
												key={key}
												className="flex justify-between border-b pb-2"
											>
												<dt className="font-medium">{key}</dt>
												<dd className="text-muted-foreground">{value}</dd>
											</div>
										)
									)}
								</dl>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="reviews" className="mt-6">
						<Card>
							<CardHeader>
								<CardTitle>Customer Reviews</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8 text-muted-foreground">
									<p>Customer reviews coming soon.</p>
									<p className="text-sm mt-2">
										Be the first to review this product!
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<div>
						<h2 className="text-2xl font-bold mb-6">Related Products</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{relatedProducts.map((relatedProduct) => (
								<Card
									key={relatedProduct.id}
									className="group cursor-pointer transition-all hover:shadow-lg"
								>
									<Link href={`/services/store/products/${relatedProduct.id}`}>
										<div className="relative aspect-square overflow-hidden rounded-t-lg">
											<Image
												src={relatedProduct.image}
												alt={relatedProduct.name}
												fill
												className="object-cover transition-transform group-hover:scale-105"
											/>
										</div>
										<CardContent className="p-4">
											<h3 className="font-semibold line-clamp-2 mb-2">
												{relatedProduct.name}
											</h3>
											<div className="flex items-center gap-2">
												<span className="font-bold text-primary">
													{relatedProduct.price.toFixed(2)} EGP
												</span>
												{relatedProduct.originalPrice && (
													<span className="text-sm text-muted-foreground line-through">
														{relatedProduct.originalPrice.toFixed(2)} EGP
													</span>
												)}
											</div>
										</CardContent>
									</Link>
								</Card>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
