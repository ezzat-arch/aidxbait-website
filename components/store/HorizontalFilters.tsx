"use client";

import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { PRODUCT_CATEGORIES } from "@/lib/store-data";
import { FilterOptions, Joint } from "@/lib/store-types";
import { JointCapsuleFilter } from "./JointCapsuleFilter";

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
		filters.joints.length > 0 ||
		filters.category !== "all" ||
		filters.priceRange.min > 0 ||
		filters.priceRange.max < 200 ||
		filters.inStock ||
		searchQuery.length > 0;

	const getActiveFiltersCount = () => {
		let count = 0;
		if (filters.joints.length > 0) count++;
		if (filters.category !== "all") count++;
		if (filters.priceRange.min > 0 || filters.priceRange.max < 200) count++;
		if (filters.inStock) count++;
		if (searchQuery.length > 0) count++;
		return count;
	};

	return (
		<div className="space-y-6 bg-background border-b pb-6">
			{/* Search Bar - Full width on mobile */}
			<div className="relative max-w-md md:max-w-lg">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Search physical therapy products..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="pl-10 h-11"
				/>
			</div>

			{/* Joint Filter - Responsive Design */}
			<JointCapsuleFilter
				selectedJoints={filters.joints}
				onJointsChange={handleJointsChange}
			/>

			{/* Other Filters Row - Mobile Optimized */}
			<div className="flex flex-col md:flex-row md:items-center gap-4">
				{/* Mobile: Stack filters vertically, Desktop: Horizontal */}
				<div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 flex-1">
					{/* Category Filter */}
					<div className="flex items-center gap-2 min-w-0">
						<span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
							Category:
						</span>
						<Select
							value={filters.category}
							onValueChange={handleCategoryChange}
						>
							<SelectTrigger className="w-full sm:w-48 h-10">
								<SelectValue placeholder="All Categories" />
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
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="h-10 flex-1 sm:flex-none sm:min-w-[120px]"
							>
								<span className="hidden sm:inline">Price Range</span>
								<span className="sm:hidden">
									{filters.priceRange.min === 0 &&
									filters.priceRange.max === 200
										? "All Prices"
										: `${filters.priceRange.min}-${filters.priceRange.max} EGP`}
								</span>
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-80" align="start">
							<div className="space-y-4">
								<h4 className="font-medium">Price Range (EGP)</h4>
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
						</PopoverContent>
					</Popover>

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

				{/* Results Count and Clear Filters */}
				<div className="flex items-center justify-between md:justify-end gap-4">
					<span className="text-sm text-muted-foreground whitespace-nowrap">
						{productsCount} products found
					</span>

					{hasActiveFilters && (
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="text-xs">
								{getActiveFiltersCount()} filters
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearFilters}
								className="text-muted-foreground hover:text-destructive h-8 px-2"
							>
								<X className="h-4 w-4 mr-1" />
								<span className="hidden sm:inline">Clear All</span>
								<span className="sm:hidden">Clear</span>
							</Button>
						</div>
					)}
				</div>
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
					{filters.joints.length > 0 && (
						<Badge variant="outline" className="gap-1">
							{filters.joints.length} joint
							{filters.joints.length > 1 ? "s" : ""} selected
							<X
								className="h-3 w-3 cursor-pointer"
								onClick={() => handleJointsChange([])}
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
							In Stock Only
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
