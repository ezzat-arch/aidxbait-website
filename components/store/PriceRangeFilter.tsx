"use client";

import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface PriceRangeFilterProps {
	priceRange: { min: number; max: number };
	onPriceRangeChange: (range: { min: number; max: number }) => void;
	className?: string;
	minPrice?: number;
	maxPrice?: number;
}

export function PriceRangeFilter({
	priceRange,
	onPriceRangeChange,
	className,
	minPrice = 0,
	maxPrice = 200,
}: PriceRangeFilterProps) {
	const t = useTranslations("store.PriceRangeFilter.text");
	const [localRange, setLocalRange] = useState([
		priceRange.min,
		priceRange.max,
	]);

	useEffect(() => {
		setLocalRange([priceRange.min, priceRange.max]);
	}, [priceRange]);

	const handleSliderChange = (values: number[]) => {
		setLocalRange(values);
		onPriceRangeChange({ min: values[0], max: values[1] });
	};

	return (
		<div className={className}>
			{/* Simple Price Range */}
			<div className="bg-muted/30 rounded-lg p-4">
				<div className="flex items-center justify-between mb-3">
					<h3 className="font-semibold text-sm text-foreground">{t("price_range")}</h3>
					<span className="text-sm font-bold text-foreground">
						{localRange[0]} - {localRange[1]} {t("currency")}
					</span>
				</div>

				{/* Slider */}
				<div className="px-1">
					<Slider
						value={localRange}
						onValueChange={handleSliderChange}
						max={maxPrice}
						min={minPrice}
						step={5}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
						<span>{minPrice} {t("currency")}</span>
						<span>{maxPrice} {t("currency")}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
