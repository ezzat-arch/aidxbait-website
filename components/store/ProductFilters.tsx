"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { JOINT_CATEGORIES, PRODUCT_CATEGORIES } from "@/lib/store-data";
import { FilterOptions, Joint } from "@/lib/store-types";

interface ProductFiltersProps {
	filters: FilterOptions;
	searchQuery: string;
	onFiltersChange: (filters: FilterOptions) => void;
	onSearchChange: (query: string) => void;
	onClearFilters: () => void;
	productsCount: number;
}

export function ProductFilters({
	filters,
	searchQuery,
	onFiltersChange,
	onSearchChange,
	onClearFilters,
	productsCount,
}: ProductFiltersProps) {
	const handleJointChange = (value: string) => {
		onFiltersChange({
			...filters,
			joint: value as Joint | "all",
		});
	};

	const handleCategoryChange = (value: string) => {
		onFiltersChange({
			...filters,
			category: value,
		});
	};

	const handlePriceRangeChange = (values: number[]) => {
		onFiltersChange({
			...filters,
			priceRange: {
				min: values[0],
				max: values[1],
			},
		});
	};

	const handleInStockChange = (checked: boolean) => {
		onFiltersChange({
			...filters,
			inStock: checked,
		});
	};

	const hasActiveFilters =
		filters.joint !== "all" ||
		filters.category !== "all" ||
		filters.priceRange.min > 0 ||
		filters.priceRange.max < 200 ||
		filters.inStock ||
		searchQuery.length > 0;

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.joint !== "all") count++;
		if (filters.category !== "all") count++;
		if (filters.priceRange.min > 0 || filters.priceRange.max < 200) count++;
		if (filters.inStock) count++;
		if (searchQuery.length > 0) count++;
		return count;
	};

	const FiltersContent = () => (
		<div className="space-y-6">
			{/* Joint Filter */}
			<div className="space-y-3">
				<h3 className="font-semibold text-sm">Joint Type</h3>
				<Select value={filters.joint} onValueChange={handleJointChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select joint type" />
					</SelectTrigger>
					<SelectContent>
						{JOINT_CATEGORIES.map((joint) => (
							<SelectItem key={joint.value} value={joint.value}>
								{joint.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Category Filter */}
			<div className="space-y-3">
				<h3 className="font-semibold text-sm">Category</h3>
				<Select value={filters.category} onValueChange={handleCategoryChange}>
					<SelectTrigger>
						<SelectValue placeholder="Select category" />
					</SelectTrigger>
					<SelectContent>
						{PRODUCT_CATEGORIES.map((category) => (
							<SelectItem key={category.value} value={category.value}>
								{category.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Price Range Filter */}
			<div className="space-y-3">
				<h3 className="font-semibold text-sm">Price Range</h3>
				<div className="px-2">
					<Slider
						value={[filters.priceRange.min, filters.priceRange.max]}
						onValueChange={handlePriceRangeChange}
						max={200}
						min={0}
						step={5}
						className="w-full"
					/>
					<div className="flex justify-between text-sm text-muted-foreground mt-2">
						<span>{filters.priceRange.min} EGP</span>
						<span>{filters.priceRange.max} EGP</span>
					</div>
				</div>
			</div>

			{/* In Stock Filter */}
			<div className="flex items-center space-x-2">
				<Checkbox
					id="inStock"
					checked={filters.inStock}
					onCheckedChange={handleInStockChange}
				/>
				<label
					htmlFor="inStock"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					In stock only
				</label>
			</div>
		</div>
	);

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Search products..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Mobile Filters */}
			<div className="flex items-center justify-between lg:hidden">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{productsCount} products
					</span>
					{hasActiveFilters && (
						<Badge variant="secondary">{getActiveFiltersCount()} filters</Badge>
					)}
				</div>

				<div className="flex items-center gap-2">
					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onClearFilters}
							className="text-muted-foreground"
						>
							<X className="h-4 w-4 mr-1" />
							Clear
						</Button>
					)}

					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<SlidersHorizontal className="h-4 w-4 mr-2" />
								Filters
								{hasActiveFilters && (
									<Badge
										variant="secondary"
										className="ml-2 h-5 w-5 p-0 text-xs"
									>
										{getActiveFiltersCount()}
									</Badge>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-80">
							<SheetHeader>
								<SheetTitle>Filters</SheetTitle>
								<SheetDescription>Refine your product search</SheetDescription>
							</SheetHeader>
							<div className="mt-6">
								<FiltersContent />
								{hasActiveFilters && (
									<Button
										variant="outline"
										onClick={onClearFilters}
										className="w-full mt-6"
									>
										<X className="h-4 w-4 mr-2" />
										Clear All Filters
									</Button>
								)}
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Desktop Filters */}
			<div className="hidden lg:block">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-semibold">Filters</h2>
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">
							{productsCount} products
						</span>
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearFilters}
								className="text-muted-foreground"
							>
								<X className="h-4 w-4 mr-1" />
								Clear All
							</Button>
						)}
					</div>
				</div>
				<FiltersContent />
			</div>

			{/* Active Filters Display */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-2">
					{searchQuery && (
						<Badge variant="outline" className="gap-1">
							Search: "{searchQuery}"
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => onSearchChange("")}
							/>
						</Badge>
					)}
					{filters.joint !== "all" && (
						<Badge variant="outline" className="gap-1">
							{JOINT_CATEGORIES.find((j) => j.value === filters.joint)?.label}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => handleJointChange("all")}
							/>
						</Badge>
					)}
					{filters.category !== "all" && (
						<Badge variant="outline" className="gap-1">
							{
								PRODUCT_CATEGORIES.find((c) => c.value === filters.category)
									?.label
							}
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => handleCategoryChange("all")}
							/>
						</Badge>
					)}
					{(filters.priceRange.min > 0 || filters.priceRange.max < 200) && (
						<Badge variant="outline" className="gap-1">
							{filters.priceRange.min} - {filters.priceRange.max} EGP
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => handlePriceRangeChange([0, 200])}
							/>
						</Badge>
					)}
					{filters.inStock && (
						<Badge variant="outline" className="gap-1">
							In Stock
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => handleInStockChange(false)}
							/>
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}
