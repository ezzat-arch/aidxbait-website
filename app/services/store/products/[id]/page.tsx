"use client";

import { useState, useEffect, use } from "react";
import { notFound, useRouter } from "next/navigation";
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
	Package,
	Calendar,
	Info,
	StarHalf,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Product } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";

interface ProductPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function ProductPage({ params }: ProductPageProps) {
	// Unwrap params using React.use()
	const unwrappedParams = use(params);

	const [product, setProduct] = useState<Product | null>(null);
	const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { addToCart } = useCart();
	const router = useRouter();

	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isLiked, setIsLiked] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	// Fetch product and related products
	useEffect(() => {
		const fetchProduct = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch the specific product
				const productResponse = await fetch(
					`/api/products/${unwrappedParams.id}`
				);
				const productResult = await productResponse.json();

				if (
					productResult.success &&
					productResult.data &&
					productResult.data[0]
				) {
					const foundProduct = productResult.data[0];
					setProduct(foundProduct);

					// Fetch all products to get related ones
					const allProductsResponse = await fetch("/api/products");
					const allProductsResult = await allProductsResponse.json();

					if (allProductsResult.success && allProductsResult.data) {
						// Get related products based on tags or joints
						const related = allProductsResult.data
							.filter((p: Product) => {
								if (p.id === foundProduct.id) return false;

								// Match by tags
								const hasCommonTag =
									foundProduct.tags &&
									p.tags &&
									foundProduct.tags.some((tag: string) =>
										p.tags?.includes(tag)
									);

								// Match by joints
								const hasCommonJoint = p.joints.some((joint) =>
									foundProduct.joints.some(
										(fj: typeof joint) => fj.joint_id === joint.joint_id
									)
								);

								return hasCommonTag || hasCommonJoint;
							})
							.slice(0, 4);

						setRelatedProducts(related);
					}
				} else {
					setError(productResult.error || "Product not found");
				}
			} catch (err) {
				console.error("Error fetching product:", err);
				setError("An unexpected error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [unwrappedParams.id]);

	// Computed values
	const isInStock =
		product?.is_available && !product?.is_oos && (product?.stock || 0) > 0;
	const effectivePrice = product?.discounted_price || product?.price || 0;
	const hasDiscount = !!product?.discounted_price;
	const discountPercentage =
		hasDiscount && product
			? Math.round(
					((product.price - product.discounted_price!) / product.price) * 100
			  )
			: 0;
	const mainImage =
		product?.images.find((img) => img.is_main)?.image_url ||
		product?.images[0]?.image_url ||
		"/placeholder.jpg";

	const handleAddToCart = async () => {
		if (!product || !isInStock) return;

		setIsAddingToCart(true);
		addToCart(product, quantity);

		setTimeout(() => {
			setIsAddingToCart(false);
			router.push("/services/store?openCart=true");
		}, 300);
	};

	const handleBuyNow = async () => {
		if (!product || !isInStock) return;

		setIsAddingToCart(true);
		addToCart(product, quantity);

		setTimeout(() => {
			setIsAddingToCart(false);
			window.location.href = "/services/store/checkout";
		}, 300);
	};

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= (product?.stock || 99)) {
			setQuantity(newQuantity);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-background pt-20 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading product...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !product) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="container mx-auto px-4 py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
					<Link href="/services/store" className="hover:text-primary">
						Store
					</Link>
					<span>/</span>
					{product.joints[0] && (
						<>
							<span className="capitalize">{product.joints[0].joint_name}</span>
							<span>/</span>
						</>
					)}
					<span className="text-foreground line-clamp-1">{product.name}</span>
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
						<div className="relative aspect-square overflow-hidden rounded-lg border-2 border-border/50 shadow-lg">
							<Image
								src={product.images[selectedImageIndex]?.image_url || mainImage}
								alt={product.name}
								fill
								className="object-cover"
								priority
							/>

							{/* Badges */}
							<div className="absolute top-4 left-4 flex flex-col gap-2">
								{hasDiscount && (
									<Badge variant="destructive" className="shadow-lg">
										-{discountPercentage}%
									</Badge>
								)}
								{product.is_best_seller && (
									<Badge className="bg-amber-500 hover:bg-amber-600 shadow-lg">
										Best Seller
									</Badge>
								)}
								{product.is_featured && (
									<Badge className="bg-purple-500 hover:bg-purple-600 shadow-lg">
										Featured
									</Badge>
								)}
								{product.is_for_rent && (
									<Badge
										variant="outline"
										className="bg-background/80 backdrop-blur-sm shadow-lg"
									>
										For Rent
									</Badge>
								)}
							</div>

							{!isInStock && (
								<Badge
									variant="outline"
									className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm shadow-lg"
								>
									Out of Stock
								</Badge>
							)}
						</div>

						{/* Image Thumbnails */}
						{product.images.length > 1 && (
							<div className="flex gap-2 overflow-x-auto pb-2">
								{product.images.map((image, index) => (
									<button
										key={image.id}
										onClick={() => setSelectedImageIndex(index)}
										className={`relative w-20 h-20 flex-shrink-0 rounded border-2 overflow-hidden transition-all ${
											selectedImageIndex === index
												? "border-primary scale-105 shadow-md"
												: "border-border hover:border-primary/50"
										}`}
									>
										<Image
											src={image.image_url}
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
							{/* Joint Badges */}
							<div className="mb-3 flex flex-wrap gap-2">
								{product.joints.map((joint) => (
									<Badge
										key={joint.joint_id}
										variant="secondary"
										className="capitalize"
									>
										{joint.joint_name === "general"
											? "All Purpose"
											: joint.joint_name}
									</Badge>
								))}
							</div>

							<h1 className="text-4xl font-bold mb-2">{product.name}</h1>

							{/* Arabic Name */}
							{product.name_ar && (
								<h2 className="text-2xl text-muted-foreground mb-4 font-arabic">
									{product.name_ar}
								</h2>
							)}

							{/* Rating */}
							{product.reviewCount > 0 && (
								<div className="flex items-center gap-2 mb-4">
									<div className="flex items-center">
										{[...Array(5)].map((_, i) => {
											const filled = i < Math.floor(product.rating);
											const half =
												i === Math.floor(product.rating) &&
												product.rating % 1 >= 0.5;
											return (
												<div key={i} className="relative">
													{half ? (
														<StarHalf className="h-5 w-5 text-yellow-400 fill-current" />
													) : (
														<Star
															className={`h-5 w-5 ${
																filled
																	? "text-yellow-400 fill-current"
																	: "text-gray-300"
															}`}
														/>
													)}
												</div>
											);
										})}
									</div>
									<span className="text-muted-foreground font-medium">
										{product.rating.toFixed(1)} ({product.reviewCount}{" "}
										{product.reviewCount === 1 ? "review" : "reviews"})
									</span>
								</div>
							)}

							{/* Price */}
							<div className="flex items-baseline gap-3 mb-4">
								<span className="text-4xl font-bold text-primary">
									{effectivePrice.toFixed(2)} {product.currency}
								</span>
								{hasDiscount && (
									<span className="text-2xl text-muted-foreground line-through">
										{product.price.toFixed(2)} {product.currency}
									</span>
								)}
							</div>

							{/* Rental Info */}
							{product.is_for_rent && product.rent_term && (
								<div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span className="capitalize">
										{product.rent_term.replace("per_", "Per ")}
									</span>
								</div>
							)}

							{/* Stock Status */}
							<div className="mb-6">
								{isInStock ? (
									<div className="flex items-center gap-2 text-green-600">
										<Check className="h-5 w-5" />
										<span className="font-medium">In Stock</span>
										{product.stock <= 10 && (
											<span className="text-amber-600 ml-2">
												(Only {product.stock} left!)
											</span>
										)}
									</div>
								) : (
									<div className="flex items-center gap-2 text-destructive">
										<Info className="h-5 w-5" />
										<span className="font-medium">Currently Unavailable</span>
									</div>
								)}
							</div>

							{/* Description */}
							<div className="space-y-4">
								{/* Arabic Description (First) */}
								{product.description_ar && (
									<div dir="rtl" className="font-arabic">
										<p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
											{isDescriptionExpanded
												? product.description_ar
												: product.description_ar.length > 200
												? `${product.description_ar.substring(0, 200)}...`
												: product.description_ar}
										</p>
									</div>
								)}

								{/* English Description (Second) */}
								{product.description && (
									<div>
										<p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
											{isDescriptionExpanded
												? product.description
												: product.description.length > 200
												? `${product.description.substring(0, 200)}...`
												: product.description}
										</p>
									</div>
								)}

								{/* Show "See More/Less" button only if description is long enough */}
								{((product.description_ar &&
									product.description_ar.length > 200) ||
									(product.description &&
										product.description.length > 200)) && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											setIsDescriptionExpanded(!isDescriptionExpanded)
										}
										className="w-full flex items-center justify-center gap-2 hover:bg-primary/10"
									>
										{isDescriptionExpanded ? (
											<>
												<span>See Less</span>
												<ChevronUp className="h-4 w-4" />
											</>
										) : (
											<>
												<span>See More</span>
												<ChevronDown className="h-4 w-4" />
											</>
										)}
									</Button>
								)}

								{/* Show message if no description */}
								{!product.description && !product.description_ar && (
									<p className="text-muted-foreground text-lg leading-relaxed">
										No description available
									</p>
								)}
							</div>
						</div>

						{/* Quantity and Actions */}
						<div className="space-y-4">
							{isInStock && (
								<div className="flex items-center gap-4">
									<label className="text-sm font-medium">Quantity:</label>
									<div className="flex items-center border-2 rounded-lg overflow-hidden">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleQuantityChange(quantity - 1)}
											disabled={quantity <= 1}
											className="h-10 w-10"
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="px-6 py-2 font-semibold min-w-[60px] text-center">
											{quantity}
										</span>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleQuantityChange(quantity + 1)}
											disabled={quantity >= product.stock}
											className="h-10 w-10"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex gap-3">
								<Button
									onClick={handleBuyNow}
									disabled={!isInStock || isAddingToCart}
									size="lg"
									className="flex-1 h-12 text-lg font-semibold"
								>
									{isAddingToCart ? "Processing..." : "Buy Now"}
								</Button>

								<Button
									variant="outline"
									onClick={handleAddToCart}
									disabled={!isInStock || isAddingToCart}
									size="lg"
									className="flex-1 h-12 text-lg font-semibold"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</Button>

								<Button
									variant="outline"
									size="lg"
									onClick={() => setIsLiked(!isLiked)}
									className={`h-12 px-6 ${
										isLiked ? "text-red-500 border-red-300 bg-red-50" : ""
									}`}
								>
									<Heart
										className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
									/>
								</Button>
							</div>
						</div>

						{/* Benefits */}
						<Card className="border-2">
							<CardContent className="p-0">
								<div className="grid grid-cols-3 divide-x">
									<div className="flex flex-col items-center text-center p-4">
										<Shield className="h-7 w-7 text-primary mb-2" />
										<span className="text-sm font-medium">
											Quality Guaranteed
										</span>
									</div>
									<div className="flex flex-col items-center text-center p-4">
										<Truck className="h-7 w-7 text-primary mb-2" />
										<span className="text-sm font-medium">Fast Shipping</span>
									</div>
									<div className="flex flex-col items-center text-center p-4">
										<RotateCcw className="h-7 w-7 text-primary mb-2" />
										<span className="text-sm font-medium">Easy Returns</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Additional Info */}
						<Card className="bg-muted/30">
							<CardContent className="p-4 space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<Package className="h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">
										SKU: <span className="font-medium">PRD-{product.id}</span>
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Customer Reviews Section */}
				<div className="mb-16">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Reviews</span>
								{product.reviewCount > 0 && (
									<div className="flex items-center gap-2">
										<Star className="h-5 w-5 text-yellow-400 fill-current" />
										<span className="text-lg font-bold">
											{product.rating.toFixed(1)}
										</span>
										<span className="text-sm text-muted-foreground">
											({product.reviewCount}{" "}
											{product.reviewCount === 1 ? "review" : "reviews"})
										</span>
									</div>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{product.reviews.length > 0 ? (
								<div className="space-y-6">
									{product.reviews.map((review) => (
										<div
											key={review.id}
											className="border-b last:border-0 pb-6 last:pb-0"
										>
											<div className="flex items-start gap-4">
												<Avatar className="h-10 w-10">
													<AvatarFallback>
														{review.patient_id
															.toString()
															.slice(0, 2)
															.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 space-y-2">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<span className="font-medium">
																{review.patient_name ||
																	`Customer ${review.patient_id}`}
															</span>
															<div className="flex items-center">
																{[...Array(5)].map((_, i) => (
																	<Star
																		key={i}
																		className={`h-4 w-4 ${
																			i < review.rating
																				? "text-yellow-400 fill-current"
																				: "text-gray-300"
																		}`}
																	/>
																))}
															</div>
														</div>
														<span className="text-sm text-muted-foreground">
															{new Date(review.created_at).toLocaleDateString()}
														</span>
													</div>
													{review.comment && (
														<p className="text-muted-foreground">
															{review.comment}
														</p>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12 text-muted-foreground">
									<Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
									<p className="text-lg mb-2">No reviews yet</p>
									<p className="text-sm">
										Be the first to review this product!
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<div>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-3xl font-bold">You May Also Like</h2>
							<Link href="/services/store">
								<Button variant="ghost">
									View All
									<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
								</Button>
							</Link>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{relatedProducts.map((relatedProduct) => {
								const relatedEffectivePrice =
									relatedProduct.discounted_price || relatedProduct.price;
								const relatedHasDiscount = !!relatedProduct.discounted_price;
								const relatedMainImage =
									relatedProduct.images.find((img) => img.is_main)?.image_url ||
									relatedProduct.images[0]?.image_url ||
									"/placeholder.jpg";
								const relatedIsInStock =
									relatedProduct.is_available &&
									!relatedProduct.is_oos &&
									relatedProduct.stock > 0;

								return (
									<Card
										key={relatedProduct.id}
										className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
									>
										<Link
											href={`/services/store/products/${relatedProduct.id}`}
										>
											<div className="relative aspect-square overflow-hidden rounded-t-lg">
												<Image
													src={relatedMainImage}
													alt={relatedProduct.name}
													fill
													className="object-cover transition-transform group-hover:scale-105"
												/>
												{relatedHasDiscount && (
													<Badge
														variant="destructive"
														className="absolute top-2 left-2"
													>
														-
														{Math.round(
															((relatedProduct.price -
																relatedProduct.discounted_price!) /
																relatedProduct.price) *
																100
														)}
														%
													</Badge>
												)}
												{!relatedIsInStock && (
													<Badge
														variant="outline"
														className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
													>
														Out of Stock
													</Badge>
												)}
											</div>
											<CardContent className="p-4">
												<h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
													{relatedProduct.name}
												</h3>
												{relatedProduct.reviewCount > 0 && (
													<div className="flex items-center gap-1 mb-2">
														<Star className="h-3 w-3 text-yellow-400 fill-current" />
														<span className="text-xs text-muted-foreground">
															{relatedProduct.rating.toFixed(1)} (
															{relatedProduct.reviewCount})
														</span>
													</div>
												)}
												<div className="flex items-center gap-2">
													<span className="font-bold text-primary text-lg">
														{relatedEffectivePrice.toFixed(2)}{" "}
														{relatedProduct.currency}
													</span>
													{relatedHasDiscount && (
														<span className="text-sm text-muted-foreground line-through">
															{relatedProduct.price.toFixed(2)}{" "}
															{relatedProduct.currency}
														</span>
													)}
												</div>
											</CardContent>
										</Link>
									</Card>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
