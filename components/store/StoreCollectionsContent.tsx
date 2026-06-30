"use client";

import { useTranslations } from "next-intl";
import { LayoutGrid, AlertCircle } from "lucide-react";
import { CollectionsSlider } from "@/components/store/CollectionsSlider";
import type { ShopifyCollectionCardModel } from "@/lib/shopify/types";

type StoreCollectionsContentProps = {
	collections: ShopifyCollectionCardModel[];
	errorMessage?: string | null;
};

export function StoreCollectionsContent({
	collections,
	errorMessage,
}: StoreCollectionsContentProps) {
	const t = useTranslations("store.StoreCollectionsContent");

	return (
		<section className="w-full bg-muted/30 py-16">
			<div className="container mx-auto px-4">
				{/* Section header */}
				<div className="flex flex-col items-center text-center mb-10">
					<div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
						<LayoutGrid className="h-4 w-4" />
						{t("badge")}
					</div>
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
						{t("heading")}
					</h2>
					<div className="flex items-center gap-3 mb-4">
						<div className="h-px w-12 bg-border" />
						<div className="w-2 h-2 rounded-full bg-primary/60" />
						<div className="h-px w-12 bg-border" />
					</div>
					<p className="text-muted-foreground max-w-xl text-sm sm:text-base">
						{t("subheading")}
					</p>
				</div>

				{/* Error state */}
				{errorMessage && (
					<div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-8 max-w-xl mx-auto">
						<AlertCircle className="h-4 w-4 shrink-0" />
						{errorMessage}
					</div>
				)}

				{/* Empty state */}
				{!errorMessage && collections.length === 0 && (
					<div className="flex flex-col items-center justify-center py-16 gap-4">
						<div className="rounded-full bg-muted p-6">
							<LayoutGrid className="h-10 w-10 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground text-center max-w-sm">
							{t("empty_catalog")}
						</p>
					</div>
				)}

				{/* Collections — auto-scrolling slider on mobile, grid on desktop */}
				{collections.length > 0 && (
					<CollectionsSlider collections={collections} />
				)}
			</div>
		</section>
	);
}
