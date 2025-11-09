"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import { HorizontalFilters } from "@/components/store/HorizontalFilters";
import { StoreCategoryTabs } from "@/components/store/StoreCategoryTabs";
import { StoreBodyMapSection } from "@/components/store/StoreBodyMapSection";
import { FilterOptions, Product, Joint } from "@/lib/store-types";
import { shouldShowBodyMap } from "@/lib/store-categories";
import { useCart } from "@/contexts/cart-context";
import { toast } from "@/hooks/use-toast";
import { useLocale } from "next-intl";
import { Locale } from "@/types/i18n";
import { localizeProducts } from "@/lib/i18n/data-utils";

const initialFilters: FilterOptions = {
	joints: [],
	priceRange: { min: 0, max: 10000 },
	inStock: false,
};

/**
 * Parse URL search params into FilterOptions and search query
 * Supports both 'joint' (singular) and 'joints' (plural) for backward compatibility
 */
function parseFiltersFromURL(searchParams: URLSearchParams): {
	filters: FilterOptions;
	search: string;
	categoryId: number | null;
} {
	const filters: FilterOptions = { ...initialFilters };
	let search = "";
	let categoryId: number | null = null;

	// Parse category
	const categoryParam = searchParams.get("category");
	if (categoryParam) {
		const parsed = parseInt(categoryParam, 10);
		if (!isNaN(parsed)) {
			categoryId = parsed;
			filters.categoryId = parsed;
		}
	}

	// Parse joints - support both singular 'joint' and plural 'joints'
	const jointParam = searchParams.get("joint");
	const jointsParam = searchParams.get("joints");

	if (jointParam) {
		// Single joint from body map navigation
		const validJoint = jointParam.toLowerCase() as Joint;
		filters.joints = [validJoint];
	} else if (jointsParam) {
		// Multiple joints comma-separated
		const joints = jointsParam
			.split(",")
			.map((j) => j.trim().toLowerCase() as Joint)
			.filter(Boolean);
		filters.joints = joints;
	}

	// Parse price range
	const minPrice = searchParams.get("minPrice");
	const maxPrice = searchParams.get("maxPrice");
	if (minPrice) {
		const parsed = parseInt(minPrice, 10);
		if (!isNaN(parsed)) filters.priceRange.min = parsed;
	}
	if (maxPrice) {
		const parsed = parseInt(maxPrice, 10);
		if (!isNaN(parsed)) filters.priceRange.max = parsed;
	}

	// Parse inStock
	const inStock = searchParams.get("inStock");
	if (inStock === "true") {
		filters.inStock = true;
	}

	// Parse search query
	const searchParam = searchParams.get("search");
	if (searchParam) {
		search = searchParam;
	}

	return { filters, search, categoryId };
}

/**
 * Build URLSearchParams from filters and search query
 * Only includes non-default values to keep URL clean
 */
function buildURLFromFilters(
	filters: FilterOptions,
	searchQuery: string,
	categoryId: number | null
): URLSearchParams {
	const params = new URLSearchParams();

	// Add category if selected
	if (categoryId !== null) {
		params.set("category", categoryId.toString());
	}

	// Add joints if any selected
	if (filters.joints.length > 0) {
		params.set("joints", filters.joints.join(","));
	}

	// Add price range if not default
	if (filters.priceRange.min !== 0) {
		params.set("minPrice", filters.priceRange.min.toString());
	}
	if (filters.priceRange.max !== 10000) {
		params.set("maxPrice", filters.priceRange.max.toString());
	}

	// Add inStock if true
	if (filters.inStock) {
		params.set("inStock", "true");
	}

	// Add search query if not empty
	if (searchQuery.trim()) {
		params.set("search", searchQuery.trim());
	}

	return params;
}

export function StoreContent() {
	const locale = useLocale() as Locale;
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<FilterOptions>(initialFilters);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { openCart, clearCart } = useCart();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const hasHandledCartOpen = useRef(false);
	const hasHandledPayment = useRef(false);
	const isInitialized = useRef(false);

	// Initialize filters, search, and category from URL params on mount
	useEffect(() => {
		if (!isInitialized.current) {
			isInitialized.current = true;
			const { filters: urlFilters, search: urlSearch, categoryId } =
				parseFiltersFromURL(searchParams);
			setFilters(urlFilters);
			setSearchQuery(urlSearch);
			setSelectedCategoryId(categoryId);
		}
	}, [searchParams]);

	// Update URL when filters, search, or category change (debounced)
	useEffect(() => {
		// Skip URL update during initial load
		if (!isInitialized.current) return;

		const timer = setTimeout(() => {
			const params = buildURLFromFilters(filters, searchQuery, selectedCategoryId);
			const newUrl = params.toString()
				? `${pathname}?${params.toString()}`
				: pathname;
			router.replace(newUrl, { scroll: false });
		}, 300); // 300ms debounce

		return () => clearTimeout(timer);
	}, [filters, searchQuery, selectedCategoryId, pathname, router]);

	// Handle payment callback (success/failure)
	useEffect(() => {
		const paymentStatus = searchParams.get("payment");
		const orderId = searchParams.get("order_id");
		const paymentError = searchParams.get("error");
		const reason = searchParams.get("reason");

		if (paymentStatus && !hasHandledPayment.current) {
			hasHandledPayment.current = true;

			if (paymentStatus === "success") {
				// Clear cart on successful payment
				clearCart();
				toast({
					title: "Payment Successful! 🎉",
					description: orderId
						? `Your order #${orderId} has been placed successfully. We'll process it shortly.`
						: "Your payment was successful. Thank you for your order!",
				});
			} else if (paymentStatus === "failed") {
				const errorMessage = paymentError
					? `Error: ${paymentError}`
					: reason
					? `Reason: ${reason}`
					: "Please try again or contact support.";
				toast({
					title: "Payment Failed",
					description: errorMessage,
					variant: "destructive",
				});
			} else if (paymentStatus === "pending") {
				toast({
					title: "Payment Pending",
					description: orderId
						? `Your order #${orderId} is pending payment confirmation.`
						: "Your payment is being processed. We'll notify you once confirmed.",
				});
			}

			// Clean up payment params while preserving filters
			const newParams = new URLSearchParams(searchParams);
			newParams.delete("payment");
			newParams.delete("order_id");
			newParams.delete("error");
			newParams.delete("reason");
			const newUrl = newParams.toString()
				? `${pathname}?${newParams.toString()}`
				: pathname;
			router.replace(newUrl);
		}
	}, [searchParams, router, clearCart, pathname]);

	// Auto-open cart drawer if openCart param is present
	useEffect(() => {
		const shouldOpenCart = searchParams.get("openCart");
		if (shouldOpenCart === "true" && !hasHandledCartOpen.current) {
			hasHandledCartOpen.current = true;
			openCart();
			// Clean up openCart param while preserving filters
			const newParams = new URLSearchParams(searchParams);
			newParams.delete("openCart");
			const newUrl = newParams.toString()
				? `${pathname}?${newParams.toString()}`
				: pathname;
			router.replace(newUrl);
		}
	}, [searchParams, openCart, router, pathname]);

	// Fetch products from API
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				setError(null);

				// Build query params
				const params = new URLSearchParams();
				if (selectedCategoryId !== null) {
					params.append("category_id", selectedCategoryId.toString());
				}
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
					// Localize products before setting them in state
					const localizedProducts = localizeProducts(result.data || [], locale);
					setProducts(localizedProducts);
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
		selectedCategoryId,
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
				product.joints.some((joint) => {
					// Extract just the joint name (first word) from "Knee Support" -> "knee"
					const jointName = joint.joint_name.toLowerCase().split(" ")[0];
					return filters.joints.includes(jointName as any);
				})
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

	const handleCategoryChange = (categoryId: number | null) => {
		setSelectedCategoryId(categoryId);
		// Update filters to include the new category
		setFilters((prev) => ({ ...prev, categoryId }));
		// Clear joint filters when changing category
		setFilters((prev) => ({ ...prev, joints: [] }));
	};

	const handleJointSelect = (joint: Joint) => {
		// Add the selected joint to the filters
		setFilters((prev) => ({
			...prev,
			joints: prev.joints.includes(joint) ? prev.joints : [...prev.joints, joint],
		}));
	};

	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Hero Section */}
			<div className="relative min-h-[400px] sm:h-[45vh] md:h-[50vh] lg:h-[40vh] max-h-[600px] overflow-hidden">
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
					<div className="text-center px-4 max-w-5xl mx-auto">
						{/* Badge */}
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
							<span className="text-white/90 text-sm font-medium">
								Premium Quality Products
							</span>
							<span className="text-white">✓</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white drop-shadow-2xl mb-4 sm:mb-6">
							Shop Physical Therapy Products
						</h1>

						{/* Subtle Divider */}
						<div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
							<div className="h-px w-16 bg-white/40" />
							<div className="w-2 h-2 rounded-full bg-white/60" />
							<div className="h-px w-16 bg-white/40" />
						</div>

						{/* Category Tabs */}
						<div className="mb-4 sm:mb-6">
							<StoreCategoryTabs
								selectedCategoryId={selectedCategoryId}
								onCategoryChange={handleCategoryChange}
							/>
						</div>

						{/* Mini Stats/Features */}
						<div className="hidden sm:flex flex-wrap items-center justify-center gap-6 text-white/90 mt-6">
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

			{/* Body Map Section - Only show for Support, Braces & Walking Aids */}
			{shouldShowBodyMap(selectedCategoryId) && (
				<StoreBodyMapSection onJointSelect={handleJointSelect} />
			)}

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
