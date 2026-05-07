"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, LayoutGrid, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { shopifyFetch } from "@/lib/shopify";
import { getCollectionByHandleQuery } from "@/lib/shopify/queries/products";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import type {
	ShopifyCollectionCardModel,
	ShopifyProductCardModel,
	StorefrontCollectionByHandleData,
} from "@/lib/shopify/types";

function mapCollectionProductsToCards(
	collection: NonNullable<StorefrontCollectionByHandleData["collection"]>
): ShopifyProductCardModel[] {
	return collection.products.edges.map(({ node }) => {
		const imgNode = node.images.edges[0]?.node;
		return {
			id: node.id,
			title: node.title,
			handle: node.handle,
			descriptionPlain: node.description?.trim() || null,
			imageUrl: imgNode?.url ?? null,
			imageAlt: imgNode?.altText ?? node.title,
			priceAmount: node.priceRange.minVariantPrice.amount,
			currencyCode: node.priceRange.minVariantPrice.currencyCode,
		};
	});
}

type CollectionsFilterSectionProps = {
	collections: ShopifyCollectionCardModel[];
	allProducts: ShopifyProductCardModel[];
};

export function CollectionsFilterSection({
	collections,
	allProducts,
}: CollectionsFilterSectionProps) {
	const t = useTranslations("store.CollectionsFilterSection");
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const activeHandle = searchParams.get("collection") ?? "all";

	const [products, setProducts] = useState<ShopifyProductCardModel[]>(allProducts);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (activeHandle === "all") {
			setProducts(allProducts);
			setError(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(false);

		shopifyFetch<StorefrontCollectionByHandleData>({
			query: getCollectionByHandleQuery,
			variables: { handle: activeHandle },
		})
			.then(({ body }) => {
				if (cancelled) return;
				const col = body.data?.collection;
				setProducts(col ? mapCollectionProductsToCards(col) : []);
			})
			.catch(() => {
				if (!cancelled) setError(true);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [activeHandle, allProducts]);

	function selectCollection(handle: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (handle === "all") {
			params.delete("collection");
		} else {
			params.set("collection", handle);
		}
		const qs = params.toString();
		router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
	}

	return (
		<section className="w-full">
			{/* Sticky tabs bar */}
			<div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm">
				<div className="container mx-auto px-4">
					<div
						className="flex gap-2 overflow-x-auto py-3 scrollbar-hide"
						role="tablist"
						aria-label="Filter by collection"
					>
						<button
							type="button"
							role="tab"
							aria-selected={activeHandle === "all"}
							onClick={() => selectCollection("all")}
							className={cn(
								"shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
								activeHandle === "all"
									? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
									: "bg-transparent text-muted-foreground border-border hover:border-primary/60 hover:text-foreground"
							)}
						>
							{t("all")}
						</button>

						{collections.map((col) => (
							<button
								key={col.id}
								type="button"
								role="tab"
								aria-selected={activeHandle === col.handle}
								onClick={() => selectCollection(col.handle)}
								className={cn(
									"shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
									activeHandle === col.handle
										? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
										: "bg-transparent text-muted-foreground border-border hover:border-primary/60 hover:text-foreground"
								)}
							>
								{col.title}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Products area */}
			<div className="container mx-auto px-4 py-8">
				{loading && (
					<div className="flex flex-col items-center justify-center py-20 gap-3">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">{t("loading")}</p>
					</div>
				)}

				{!loading && error && (
					<div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-md mx-auto">
						<AlertCircle className="h-4 w-4 shrink-0" />
						{t("fetch_error")}
					</div>
				)}

				{!loading && !error && products.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
						<div className="rounded-full bg-muted p-5">
							<LayoutGrid className="h-9 w-9 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground max-w-sm">{t("empty")}</p>
					</div>
				)}

				{!loading && !error && products.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map((product) => (
							<ShopifyProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
