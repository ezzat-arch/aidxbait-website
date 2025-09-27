"use client";

import { useState, useMemo } from "react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { HorizontalFilters } from "@/components/store/HorizontalFilters";
import { DUMMY_PRODUCTS } from "@/lib/store-data";
import { FilterOptions, Product } from "@/lib/store-types";

const initialFilters: FilterOptions = {
	joints: [], // Changed to empty array for multi-select
	priceRange: { min: 0, max: 200 },
	category: "all",
	inStock: false,
};

export default function StorePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [filters, setFilters] = useState<FilterOptions>(initialFilters);

	const filteredProducts = useMemo(() => {
		let results = DUMMY_PRODUCTS;

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			results = results.filter(
				(product) =>
					product.name.toLowerCase().includes(query) ||
					product.description.toLowerCase().includes(query) ||
					product.category.toLowerCase().includes(query) ||
					product.joint.toLowerCase().includes(query) ||
					product.features.some((feature) =>
						feature.toLowerCase().includes(query)
					)
			);
		}

		// Joint filter - now supports multiple joints
		if (filters.joints.length > 0) {
			results = results.filter((product) =>
				filters.joints.includes(product.joint)
			);
		}

		// Category filter
		if (filters.category !== "all") {
			results = results.filter(
				(product) => product.category === filters.category
			);
		}

		// Price range filter
		results = results.filter(
			(product) =>
				product.price >= filters.priceRange.min &&
				product.price <= filters.priceRange.max
		);

		// In stock filter
		if (filters.inStock) {
			results = results.filter((product) => product.inStock);
		}

		return results;
	}, [searchQuery, filters]);

	const handleClearFilters = () => {
		setSearchQuery("");
		setFilters(initialFilters);
	};

	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b">
				<div className="container mx-auto px-4 py-16 text-center">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
						Physical Therapy Store
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
						Discover premium physical therapy equipment and support products
						designed to aid your recovery and enhance your well-being.
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
						<span className="flex items-center gap-2">
							✓ Professional Grade Equipment
						</span>
						<span className="flex items-center gap-2">
							✓ Expert Recommended
						</span>
						<span className="flex items-center gap-2">✓ Fast Shipping</span>
						<span className="flex items-center gap-2">
							✓ Quality Guaranteed
						</span>
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

				{/* Product Grid */}
				<ProductGrid products={filteredProducts} />
			</div>
		</div>
	);
}
