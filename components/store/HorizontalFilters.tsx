"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterOptions, Joint } from "@/lib/store-types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { JOINT_CATEGORIES } from "@/lib/store-data";

interface HorizontalFiltersProps {
	filters: FilterOptions;
	searchQuery: string;
	onFiltersChange: (filters: FilterOptions) => void;
	onSearchChange: (query: string) => void;
	onClearFilters: () => void;
	productsCount: number;
}

export function HorizontalFilters({
	filters,
	searchQuery,
	onFiltersChange,
	onSearchChange,
	onClearFilters,
	productsCount,
}: HorizontalFiltersProps) {
	const handleJointsChange = (joints: Joint[]) => {
		onFiltersChange({
			...filters,
			joints,
		});
	};

	const handlePriceRangeChange = (range: { min: number; max: number }) => {
		onFiltersChange({
			...filters,
			priceRange: range,
		});
	};

	const handleInStockChange = (checked: boolean) => {
		onFiltersChange({
			...filters,
			inStock: checked,
		});
	};

	const hasActiveFilters =
		filters.joints.length > 0 ||
		filters.priceRange.min > 0 ||
		filters.priceRange.max < 10000 ||
		filters.inStock ||
		searchQuery.length > 0;

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.joints.length > 0) count++;
		if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
		if (filters.inStock) count++;
		if (searchQuery.length > 0) count++;
		return count;
	};

	// Prepare joint options for MultiSelect (exclude "all")
	const jointOptions = JOINT_CATEGORIES.filter(
		(joint) => joint.value !== "all"
	).map((joint) => ({
		value: joint.value,
		label: joint.label,
	}));

	return (
		<div className="space-y-4 bg-background border-b pb-6">
			{/* Desktop: Single row with all filters */}
			<div className="hidden lg:flex gap-3 items-center">
				{/* Search Bar */}
				<div className="relative flex-1 min-w-0">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
					<Input
						placeholder="Search products..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-10 pr-10 h-12 border-2 shadow-sm w-full"
					/>
					{searchQuery && (
						<button
							type="button"
							aria-label="Clear search"
							onClick={() => onSearchChange("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* Body Part MultiSelect */}
				<div className="w-[200px]">
					<MultiSelect
						options={jointOptions}
						selected={filters.joints}
						onChange={handleJointsChange}
						placeholder="Body Part"
						searchPlaceholder="Search body parts..."
						emptyText="No body parts found."
						maxDisplayed={2}
					/>
				</div>

				{/* Price Range Filter */}
				<div className="flex-1 max-w-sm">
					<PriceRangeFilter
						priceRange={filters.priceRange}
						onPriceRangeChange={handlePriceRangeChange}
					/>
				</div>

				{/* In Stock Toggle */}
				<div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-br from-muted/40 to-background border-2 border-border/60 rounded-xl shadow-md hover:shadow-lg transition-shadow whitespace-nowrap">
					<Checkbox
						id="inStock"
						checked={filters.inStock}
						onCheckedChange={handleInStockChange}
						className="w-5 h-5"
					/>
					<label
						htmlFor="inStock"
						className="text-sm font-semibold leading-none cursor-pointer select-none"
					>
						In Stock Only
					</label>
				</div>
			</div>

			{/* Mobile: Two rows */}
			<div className="lg:hidden space-y-3">
				{/* Row 1: Search + Body Part */}
				<div className="flex gap-3">
					{/* Search Bar */}
					<div className="relative flex-1 min-w-0">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
						<Input
							placeholder="Search products..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-10 pr-10 h-12 border-2 shadow-sm w-full"
						/>
						{searchQuery && (
							<button
								type="button"
								aria-label="Clear search"
								onClick={() => onSearchChange("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					{/* Body Part MultiSelect */}
					<div className="w-[140px]">
						<MultiSelect
							options={jointOptions}
							selected={filters.joints}
							onChange={handleJointsChange}
							placeholder="Body Part"
							searchPlaceholder="Search..."
							emptyText="No results."
							maxDisplayed={1}
						/>
					</div>
				</div>

				{/* Row 2: Price Range + In Stock */}
				<div className="flex gap-3 items-center">
					{/* Price Range Filter */}
					<div className="flex-1">
						<PriceRangeFilter
							priceRange={filters.priceRange}
							onPriceRangeChange={handlePriceRangeChange}
						/>
					</div>

					{/* In Stock Toggle */}
					<div className="flex items-center space-x-2 px-3 py-3 bg-gradient-to-br from-muted/40 to-background border-2 border-border/60 rounded-xl shadow-md whitespace-nowrap">
						<Checkbox
							id="inStock-mobile"
							checked={filters.inStock}
							onCheckedChange={handleInStockChange}
							className="w-5 h-5"
						/>
						<label
							htmlFor="inStock-mobile"
							className="text-xs font-semibold leading-none cursor-pointer select-none"
						>
							In Stock
						</label>
					</div>
				</div>
			</div>

			{/* Results Count and Clear Filters */}
			<div className="flex items-center justify-between gap-4">
				<Badge
					variant="secondary"
					className="text-sm font-bold px-4 py-2 shadow-sm"
				>
					{productsCount} {productsCount === 1 ? "product" : "products"} found
				</Badge>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onClearFilters}
						className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 px-4 font-medium"
					>
						<X className="h-4 w-4 mr-1.5" />
						<span className="hidden sm:inline">Clear All Filters</span>
						<span className="sm:hidden">Clear</span>
					</Button>
				)}
			</div>
		</div>
	);
}
