"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, LayoutGrid, AlertCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { shopifyFetch } from "@/lib/shopify";
import {
	getCollectionByHandleQuery,
	searchProductsQuery,
} from "@/lib/shopify/queries/products";
import { buildShopifyProductSearchQuery } from "@/lib/shopify/build-product-search-query";
import { mapStorefrontProductsToCards } from "@/lib/shopify/map-storefront-products";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import type {
	ShopifyCollectionCardModel,
	ShopifyProductCardModel,
	StorefrontCollectionByHandleData,
	StorefrontProductsQueryData,
} from "@/lib/shopify/types";

/** Delay before search triggers URL update + Shopify API call */
const SEARCH_DEBOUNCE_MS = 500;

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
	const urlSearch = searchParams.get("search") ?? "";

	const [searchInput, setSearchInput] = useState(urlSearch);
	const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
	const debouncedSearchTrimmed = debouncedSearch.trim();

	const [products, setProducts] = useState<ShopifyProductCardModel[]>(allProducts);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	const isSearchPending = searchInput.trim() !== debouncedSearchTrimmed;

	// Sync input when URL changes (back/forward, clear from outside)
	useEffect(() => {
		setSearchInput(urlSearch);
	}, [urlSearch]);

	// Debounced search → URL
	useEffect(() => {
		if (debouncedSearchTrimmed === urlSearch) return;

		const params = new URLSearchParams(searchParams.toString());
		if (debouncedSearchTrimmed) {
			params.set("search", debouncedSearchTrimmed);
		} else {
			params.delete("search");
		}
		const qs = params.toString();
		router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
	}, [debouncedSearchTrimmed, urlSearch, searchParams, pathname, router]);

	const handleSearchChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setSearchInput(event.target.value);
		},
		[]
	);

	const handleSearchClear = useCallback(() => {
		setSearchInput("");
		const params = new URLSearchParams(searchParams.toString());
		params.delete("search");
		const qs = params.toString();
		router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
	}, [searchParams, pathname, router]);

	// Load products when debounced search or collection changes
	useEffect(() => {
		let cancelled = false;

		async function loadProducts() {
			setError(false);

			if (debouncedSearchTrimmed) {
				setLoading(true);
				const shopifyQuery = buildShopifyProductSearchQuery(
					debouncedSearchTrimmed,
					activeHandle === "all" ? null : activeHandle
				);

				try {
					const { body } = await shopifyFetch<StorefrontProductsQueryData>({
						query: searchProductsQuery,
						variables: { query: shopifyQuery },
					});
					if (cancelled) return;
					setProducts(mapStorefrontProductsToCards(body.data));
				} catch {
					if (!cancelled) setError(true);
				} finally {
					if (!cancelled) setLoading(false);
				}
				return;
			}

			if (activeHandle === "all") {
				setProducts(allProducts);
				setLoading(false);
				return;
			}

			setLoading(true);
			try {
				const { body } = await shopifyFetch<StorefrontCollectionByHandleData>({
					query: getCollectionByHandleQuery,
					variables: { handle: activeHandle },
				});
				if (cancelled) return;
				const col = body.data?.collection;
				setProducts(col ? mapCollectionProductsToCards(col) : []);
			} catch {
				if (!cancelled) setError(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void loadProducts();

		return () => {
			cancelled = true;
		};
	}, [activeHandle, debouncedSearchTrimmed, allProducts]);

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

	const isSearching = Boolean(debouncedSearchTrimmed);
	const showLoading = loading || isSearchPending;
	const emptyMessage = isSearching ? t("empty_search") : t("empty");
	const loadingMessage = isSearchPending || isSearching ? t("searching") : t("loading");

	return (
		<section className="w-full">
			<div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b shadow-sm">
				<div className="container mx-auto px-4 space-y-3 py-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							value={searchInput}
							onChange={handleSearchChange}
							placeholder={t("search_placeholder")}
							className="h-11 pl-10 pr-10 border-2"
							aria-label={t("search_placeholder")}
							autoComplete="off"
						/>
						{searchInput && (
							<button
								type="button"
								onClick={handleSearchClear}
								aria-label={t("clear_search")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					<p className="text-xs text-muted-foreground">{t("search_hint")}</p>

					<div
						className="flex flex-wrap gap-1.5 md:gap-2 sm:flex-nowrap sm:overflow-x-auto sm:scrollbar-hide"
						role="tablist"
						aria-label="Filter by collection"
					>
						<button
							type="button"
							role="tab"
							aria-selected={activeHandle === "all"}
							onClick={() => selectCollection("all")}
							className={cn(
								"sm:shrink-0 px-4 py-2 text-xs md:text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
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
									"sm:shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
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

			<div className="container mx-auto px-4 py-8">
				{showLoading && (
					<div className="flex flex-col items-center justify-center py-20 gap-3">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">{loadingMessage}</p>
					</div>
				)}

				{!showLoading && error && (
					<div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-md mx-auto">
						<AlertCircle className="h-4 w-4 shrink-0" />
						{t("fetch_error")}
					</div>
				)}

				{!showLoading && !error && products.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
						<div className="rounded-full bg-muted p-5">
							<LayoutGrid className="h-9 w-9 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground max-w-sm">{emptyMessage}</p>
					</div>
				)}

				{!showLoading && !error && products.length > 0 && (
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
