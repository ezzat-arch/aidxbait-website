"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/types/i18n";
import { cn } from "@/lib/utils";
import { StoreCategory, StoreSubcategory } from "@/lib/store-types";

interface CategoryFilterProps {
    selectedCategoryId: number | null;
    selectedSubcategoryId?: number | null;
    onCategoryChange: (categoryId: number | null) => void;
    onSubcategoryChange?: (subcategoryId: number | null) => void;
    placeholder?: string;
    className?: string;
    categories: StoreCategory[];
}

export function CategoryFilter({
    categories,
    selectedCategoryId,
    selectedSubcategoryId = null,
    onCategoryChange,
    onSubcategoryChange,
    placeholder = "Select category",
    className,
}: CategoryFilterProps) {
    const locale = useLocale() as Locale;
    const t = useTranslations("store.CategoryFilter");
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
        selectedCategoryId
    );

    // Get localized category name
    const getCategoryName = (category: StoreCategory) => {
        return locale === "ar" ? category.name_ar : category.name;
    };

    // Get localized subcategory name
    const getSubcategoryName = (subcategory: StoreSubcategory) => {
        return locale === "ar" ? subcategory.name_ar : subcategory.name;
    };

    // Handle category click
    const handleCategoryClick = (categoryId: number | null) => {
        if (categoryId === null) {
            // "All Products" - clear selection
            onCategoryChange(null);
            if (onSubcategoryChange) {
                onSubcategoryChange(null);
            }
            setExpandedCategoryId(null);
        } else {
            // Toggle expansion or select category
            if (expandedCategoryId === categoryId) {
                // Collapse if already expanded
                setExpandedCategoryId(null);
            } else {
                // Expand and select category
                setExpandedCategoryId(categoryId);
                onCategoryChange(categoryId);
                if (onSubcategoryChange) {
                    onSubcategoryChange(null); // Clear subcategory when changing category
                }
            }
        }
    };

    // Handle subcategory click
    const handleSubcategoryClick = (subcategoryId: number) => {
        if (onSubcategoryChange) {
            onSubcategoryChange(subcategoryId);
        }
    };

    // Check if a category has subcategories
    const hasSubcategories = (category: StoreCategory) => {
        return category.subcategories && category.subcategories.length > 0;
    };

    // Get selected category
    const selectedCategory = categories.find(
        (cat) => cat.id === selectedCategoryId
    );

    return (
        <div className={cn("space-y-2 w-full", className)}>
            {/* Main Categories */}
            <div className="flex flex-wrap gap-2">
                {/* "All Products" option */}
                <Button
                    variant={selectedCategoryId === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryClick(null)}
                    className={cn(
                        "h-10 px-4 text-sm font-medium transition-all",
                        selectedCategoryId === null && "bg-primary text-primary-foreground"
                    )}
                >
                    {t("all_products")}
                </Button>

                {/* Categories from API */}
                {categories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    const isExpanded = expandedCategoryId === category.id;
                    const hasSubcats = hasSubcategories(category);

                    return (
                        <div key={category.id} className="flex flex-col gap-2">
                            <Button
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleCategoryClick(category.id)}
                                className={cn(
                                    "h-10 px-4 text-sm font-medium transition-all",
                                    isSelected && "bg-primary text-primary-foreground",
                                    hasSubcats && "pr-3"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    {getCategoryName(category)}
                                    {hasSubcats && (
                                        <span className="ml-1">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </span>
                                    )}
                                </span>
                            </Button>

                            {/* Subcategories */}
                            {isExpanded && hasSubcats && category.subcategories && (
                                <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-border/40">
                                    {category.subcategories.map((subcategory) => {
                                        const isSubSelected = selectedSubcategoryId === subcategory.id;
                                        return (
                                            <Badge
                                                key={subcategory.id}
                                                variant={isSubSelected ? "default" : "outline"}
                                                className={cn(
                                                    "cursor-pointer px-3 py-1.5 text-xs font-medium transition-all hover:bg-primary/10",
                                                    isSubSelected && "bg-primary text-primary-foreground"
                                                )}
                                                onClick={() => handleSubcategoryClick(subcategory.id)}
                                            >
                                                {getSubcategoryName(subcategory)}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

