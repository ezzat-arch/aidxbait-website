"use client";

import { useTranslations } from "next-intl";
import { Product } from "@/lib/store-types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
	products: Product[];
	className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
	const t = useTranslations("store.ProductGrid.text");
	if (products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4">
				<div className="text-center space-y-4">
					<div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
						<svg
							className="w-8 h-8 text-muted-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m2 8l2 2 4-4"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-foreground">
						{t("no_products_found")}
					</h3>
					<p className="text-muted-foreground max-w-md">
						{t("we_couldn_t_find_any")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
		>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}
