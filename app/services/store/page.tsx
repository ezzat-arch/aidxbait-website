"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import { HorizontalFilters } from "@/components/store/HorizontalFilters";
import { FilterOptions, Product } from "@/lib/store-types";
import { useCart } from "@/contexts/cart-context";

const initialFilters: FilterOptions = {
	joints: [],
	priceRange: { min: 0, max: 10000 },
	inStock: false,
};

export default function StorePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<FilterOptions>(initialFilters);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { openCart } = useCart();
	const router = useRouter();
	const searchParams = useSearchParams();
	const hasHandledCartOpen = useRef(false);

	// Auto-open cart drawer if openCart param is present
	useEffect(() => {
		const shouldOpenCart = searchParams.get("openCart");
		if (shouldOpenCart === "true" && !hasHandledCartOpen.current) {
			hasHandledCartOpen.current = true;
			openCart();
			// Clean up URL without adding to history
			router.replace("/services/store");
		}
	}, [searchParams, openCart, router]);

	// Fetch products from API
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				setError(null);

				// Build query params
				const params = new URLSearchParams();
				if (filters.inStock) {
					params.append("in_stock", "true");
				}
				if (filters.currency) {
					params.append("currency", filters.currency);
				}
				if (filters.isBestSeller) {
					params.append("is_best_seller", "true");
				}
				if (filters.isFeatured) {
					params.append("is_featured", "true");
				}
				if (filters.isForRent) {
					params.append("is_for_rent", "true");
				}

				const response = await fetch(`/api/products?${params.toString()}`);
				const result = await response.json();

				if (result.success) {
					setProducts(result.data || []);
				} else {
					setError(result.error || "Failed to fetch products");
				}
			} catch (err) {
				console.error("Error fetching products:", err);
				setError("An unexpected error occurred");
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [
		filters.inStock,
		filters.currency,
		filters.isBestSeller,
		filters.isFeatured,
		filters.isForRent,
	]);

	const filteredProducts = useMemo(() => {
		let results = products;

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			results = results.filter(
				(product) =>
					product.name.toLowerCase().includes(query) ||
					product.name_ar.toLowerCase().includes(query) ||
					product.description?.toLowerCase().includes(query) ||
					product.description_ar?.toLowerCase().includes(query) ||
					product.joints.some(
						(joint) =>
							joint.joint_name.toLowerCase().includes(query) ||
							joint.joint_name_ar.toLowerCase().includes(query)
					) ||
					product.tags?.some((tag) => tag.toLowerCase().includes(query))
			);
		}

		// Joint filter - supports multiple joints
		if (filters.joints.length > 0) {
			results = results.filter((product) =>
				product.joints.some((joint) =>
					filters.joints.includes(joint.joint_name.toLowerCase() as any)
				)
			);
		}

		// Price range filter
		results = results.filter((product) => {
			const effectivePrice = product.discounted_price || product.price;
			return (
				effectivePrice >= filters.priceRange.min &&
				effectivePrice <= filters.priceRange.max
			);
		});

		return results;
	}, [searchQuery, filters, products]);

	const handleClearFilters = () => {
		setSearchQuery("");
		setFilters(initialFilters);
	};

	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Hero Section */}
			<div className="relative h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden">
				{/* Background Image with Overlay */}
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')`,
					}}
				>
					<div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70" />
				</div>

				{/* Decorative Elements */}
				<div className="absolute inset-0 overflow-hidden">
					{/* Top Right Circle */}
					<div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
					{/* Bottom Left Circle */}
					<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
					{/* Center Pattern */}
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
							backgroundSize: "40px 40px",
						}}
					/>
				</div>

				{/* Content */}
				<div className="relative h-full flex items-center justify-center">
					<div className="text-center px-4 max-w-4xl mx-auto">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
							<span className="text-white/90 text-sm font-medium">
								Premium Quality Products
							</span>
							<span className="text-white">✓</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white drop-shadow-2xl mb-6">
							Shop Physical Therapy Products
						</h1>

						{/* Subtle Divider */}
						<div className="flex items-center justify-center gap-3 mb-6">
							<div className="h-px w-16 bg-white/40" />
							<div className="w-2 h-2 rounded-full bg-white/60" />
							<div className="h-px w-16 bg-white/40" />
						</div>

						{/* Mini Stats/Features */}
						<div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm">
									🏥
								</div>
								<span className="text-sm font-light">Medical Grade</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm">
									⚡
								</div>
								<span className="text-sm font-light">Fast Delivery</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm">
									💯
								</div>
								<span className="text-sm font-light">Expert Approved</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				{/* Horizontal Filters */}
				<div className="mb-8">
					<HorizontalFilters
						filters={filters}
						searchQuery={searchQuery}
						onFiltersChange={setFilters}
						onSearchChange={setSearchQuery}
						onClearFilters={handleClearFilters}
						productsCount={filteredProducts.length}
					/>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-muted-foreground">Loading products...</p>
						</div>
					</div>
				)}

				{/* Error State */}
				{error && !loading && (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<p className="text-destructive mb-4">{error}</p>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
							>
								Retry
							</button>
						</div>
					</div>
				)}

				{/* Product Grid */}
				{!loading && !error && <ProductGrid products={filteredProducts} />}

				{/* No Products State */}
				{!loading && !error && filteredProducts.length === 0 && (
					<div className="flex items-center justify-center py-20">
						<div className="text-center">
							<p className="text-muted-foreground text-lg mb-4">
								No products found matching your criteria
							</p>
							<button
								onClick={handleClearFilters}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
							>
								Clear Filters
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
