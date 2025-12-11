import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
	ArrowLeft,
	Star,
	Check,
	Shield,
	Truck,
	RotateCcw,
	Package,
	Calendar,
	Info,
	StarHalf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Product } from "@/lib/store-types";
import { ProductActions } from "@/components/store/ProductActions";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { ProductDescription } from "@/components/store/ProductDescription";
import { ProductViewTracker } from "@/components/store/ProductViewTracker";

interface ProductPageProps {
	params: Promise<{
		id: string;
	}>;
}

// Fetch product data server-side
async function getProduct(id: string): Promise<Product | null> {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/products/${id}`, {
			cache: "no-store", // SSR - fresh data on every request
		});

		if (!response.ok) {
			return null;
		}

		const result = await response.json();
		if (result.success && result.data && result.data[0]) {
			return result.data[0];
		}
		return null;
	} catch (error) {
		console.error("Error fetching product:", error);
		return null;
	}
}

// Fetch related products
async function getRelatedProducts(product: Product): Promise<Product[]> {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/products`, {
			cache: "no-store",
		});

		if (!response.ok) {
			return [];
		}

		const result = await response.json();
		if (result.success && result.data) {
			// Get related products based on tags or joints
			const related = result.data
				.filter((p: Product) => {
					if (p.id === product.id) return false;

					// Match by tags
					const hasCommonTag =
						product.tags &&
						p.tags &&
						product.tags.some((tag: string) => p.tags?.includes(tag));

					// Match by joints
					const hasCommonJoint = p.joints.some((joint) =>
						product.joints.some((fj) => fj.joint_id === joint.joint_id)
					);

					return hasCommonTag || hasCommonJoint;
				})
				.slice(0, 4);

			return related;
		}
		return [];
	} catch (error) {
		console.error("Error fetching related products:", error);
		return [];
	}
}

// Generate metadata for SEO
export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { id } = await params;
	const product = await getProduct(id);

	if (!product) {
		return {
			title: "Product Not Found | AidXBait Store",
		};
	}

	// Prepare description (limit to 155 chars for optimal SEO)
	const description =
		product.description?.substring(0, 155) ||
		product.description_ar?.substring(0, 155) ||
		`${product.name} - Available at AidXBait Store`;

	// Get main image
	const mainImage =
		product.images.find((img) => img.is_main)?.image_url ||
		product.images[0]?.image_url ||
		"/placeholder.jpg";

	// Combine tags and joint names for keywords
	const keywords = [
		...(product.tags || []),
		...product.joints.map((j) => j.joint_name),
		...product.joints.map((j) => j.joint_name_ar),
		"physical therapy",
		"medical equipment",
		"AidXBait",
	].join(", ");

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const productUrl = `${baseUrl}/services/store/products/${id}`;

	// Calculate effective price
	const effectivePrice = product.discounted_price || product.price;

	return {
		title: `${product.name} | AidXBait Store`,
		description,
		keywords,
		authors: [{ name: "AidXBait" }],
		openGraph: {
			title: product.name,
			description,
			url: productUrl,
			siteName: "AidXBait",
			images: [
				{
					url: mainImage,
					width: 800,
					height: 800,
					alt: product.name,
				},
			],
			locale: "en_US",
			alternateLocale: "ar_EG",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: product.name,
			description,
			images: [mainImage],
		},
		alternates: {
			canonical: productUrl,
		},
		other: {
			"product:price:amount": effectivePrice.toString(),
			"product:price:currency": product.currency,
			"product:availability":
				product.is_available && !product.is_oos && product.stock > 0
					? "in stock"
					: "out of stock",
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;
	const product = await getProduct(id);

	if (!product) {
		notFound();
	}

	const relatedProducts = await getRelatedProducts(product);

	// Computed values
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

	// Prepare structured data (JSON-LD) for SEO
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const productUrl = `${baseUrl}/services/store/products/${id}`;

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		image: product.images.map((img) => img.image_url),
		description: product.description || product.description_ar || product.name,
		sku: `PRD-${product.id}`,
		brand: {
			"@type": "Brand",
			name: "AidXBait",
		},
		offers: {
			"@type": "Offer",
			url: productUrl,
			priceCurrency: product.currency,
			price: effectivePrice,
			priceValidUntil: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			).toISOString(),
			availability: isInStock
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
			itemCondition: "https://schema.org/NewCondition",
		},
		...(product.reviewCount > 0 && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: product.rating,
				reviewCount: product.reviewCount,
				bestRating: 5,
				worstRating: 1,
			},
		}),
		...(product.reviews.length > 0 && {
			review: product.reviews.slice(0, 5).map((review) => ({
				"@type": "Review",
				reviewRating: {
					"@type": "Rating",
					ratingValue: review.rating,
					bestRating: 5,
					worstRating: 1,
				},
				author: {
					"@type": "Person",
					name: review.patient_name || `Customer ${review.patient_id}`,
				},
				datePublished: review.created_at,
				reviewBody: review.comment || "",
			})),
		}),
	};

	// Breadcrumb structured data
	const breadcrumbData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: baseUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Store",
				item: `${baseUrl}/services/store`,
			},
			...(product.joints[0]
				? [
						{
							"@type": "ListItem",
							position: 3,
							name: product.joints[0].joint_name,
							item: `${baseUrl}/services/store?joint=${product.joints[0].joint_name}`,
						},
						{
							"@type": "ListItem",
							position: 4,
							name: product.name,
							item: productUrl,
						},
				  ]
				: [
						{
							"@type": "ListItem",
							position: 3,
							name: product.name,
							item: productUrl,
						},
				  ]),
		],
	};

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
			/>

			{/* Client-side view tracking */}
			<ProductViewTracker productId={product.id} />

			<div className="min-h-screen bg-background pt-20">
				<div className="container mx-auto px-4 py-8">
					{/* Breadcrumb */}
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
					>
						<Link href="/services/store" className="hover:text-primary">
							Store
						</Link>
						<span>/</span>
						{product.joints[0] && (
							<>
								<span className="capitalize">
									{product.joints[0].joint_name}
								</span>
								<span>/</span>
							</>
						)}
						<span className="text-foreground line-clamp-1">{product.name}</span>
					</nav>

					{/* Back Button */}
					<Button variant="ghost" className="mb-6 -ml-4" asChild>
						<Link href="/services/store">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Store
						</Link>
					</Button>

					{/* Product Details */}
					<article className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
						{/* Product Images */}
						<ProductImageGallery
							images={product.images}
							productName={product.name}
							mainImage={mainImage}
							hasDiscount={hasDiscount}
							discountPercentage={discountPercentage}
							isBestSeller={product.is_best_seller}
							isFeatured={product.is_featured}
							isForRent={product.is_for_rent}
							isInStock={isInStock}
						/>

						{/* Product Info */}
						<div className="space-y-6">
							<header>
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
									<h2
										className="text-2xl text-muted-foreground mb-4 font-arabic"
										lang="ar"
									>
										{product.name_ar}
									</h2>
								)}

								{/* Rating */}
								{product.reviewCount > 0 && (
									<div className="flex items-center gap-2 mb-4">
										<div
											className="flex items-center"
											role="img"
											aria-label={`Rating: ${product.rating} out of 5 stars`}
										>
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
								<ProductDescription
									description={product.description}
									descriptionAr={product.description_ar}
								/>
							</header>

							{/* Quantity and Actions */}
							<ProductActions product={product} isInStock={isInStock} />

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
					</article>

					{/* Customer Reviews Section */}
					<section className="mb-16" aria-labelledby="reviews-heading">
						<Card>
							<CardHeader>
								<CardTitle
									id="reviews-heading"
									className="flex items-center justify-between"
								>
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
											<article
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
																<div
																	className="flex items-center"
																	role="img"
																	aria-label={`${review.rating} out of 5 stars`}
																>
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
															<time
																className="text-sm text-muted-foreground"
																dateTime={review.created_at}
															>
																{new Date(
																	review.created_at
																).toLocaleDateString()}
															</time>
														</div>
														{review.comment && (
															<p className="text-muted-foreground">
																{review.comment}
															</p>
														)}
													</div>
												</div>
											</article>
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
					</section>

					{/* Related Products */}
					{relatedProducts.length > 0 && (
						<section aria-labelledby="related-heading">
							<div className="flex items-center justify-between mb-6">
								<h2 id="related-heading" className="text-3xl font-bold">
									You May Also Like
								</h2>
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
										relatedProduct.images.find((img) => img.is_main)
											?.image_url ||
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
						</section>
					)}
				</div>
			</div>
		</>
	);
}
