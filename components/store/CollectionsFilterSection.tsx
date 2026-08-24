"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	Loader2,
	LayoutGrid,
	AlertCircle,
	Search,
	X,
	PersonStanding,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { InteractiveBodyMap } from "@/components/body-map";
import type { BodyPart } from "@/types/body-map-types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { shopifyFetch } from "@/lib/shopify";
import {
	getCollectionByHandleQuery,
	searchProductsQuery,
} from "@/lib/shopify/queries/products";
import {
	buildShopifyProductSearchQuery,
	buildShopifyTagSearchQuery,
} from "@/lib/shopify/build-product-search-query";
import {
	mapStorefrontProductNodeToCard,
	mapStorefrontProductsToCards,
} from "@/lib/shopify/map-storefront-products";
import { toShopifyLanguage } from "@/lib/shopify/locale";
import { filterProductsLocally } from "@/lib/shopify/filter-products-locally";
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
	return collection.products.edges.map(({ node }) =>
		mapStorefrontProductNodeToCard(node)
	);
}

type CollectionsFilterSectionProps = {
	collections: ShopifyCollectionCardModel[];
	allProducts: ShopifyProductCardModel[];
	/** Current app locale ("en" | "ar") — drives Shopify localized fetches. */
	locale: string;
};

export function CollectionsFilterSection({
	collections,
	allProducts,
	locale,
}: CollectionsFilterSectionProps) {
	const t = useTranslations("store.CollectionsFilterSection");
	const language = toShopifyLanguage(locale);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const activeHandle = searchParams.get("collection") ?? "all";
	const urlSearch = searchParams.get("search") ?? "";
	// Body-map deep link: /services/store?joint=shoulder → filter by product tag.
	// A free-text search in the box takes priority over the joint tag.
	const jointTag = (searchParams.get("joint") ?? "").trim();

	const [searchInput, setSearchInput] = useState(urlSearch);
	// An emptied box applies instantly: without this, the pending timer would
	// re-commit the old term right after a clear and bring the results back.
	const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS, {
		immediateWhen: (value) => value.trim() === "",
	});
	const debouncedSearchTrimmed = debouncedSearch.trim();

	const [bodyMapOpen, setBodyMapOpen] = useState(false);

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
			// Free-text search supersedes a body-map joint deep link.
			params.delete("joint");
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

	// Clearing the box is enough — the debounce applies "" immediately and the
	// sync effect above drops `search` from the URL.
	const handleSearchClear = useCallback(() => {
		setSearchInput("");
	}, []);

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

				// Source list for the client-side fallback, already localized via
				// @inContext. Scoped to the active collection when one is selected.
				async function localFallbackSource(): Promise<ShopifyProductCardModel[]> {
					if (activeHandle === "all") return allProducts;
					try {
						const { body } = await shopifyFetch<StorefrontCollectionByHandleData>({
							query: getCollectionByHandleQuery,
							variables: { handle: activeHandle },
							language,
						});
						const col = body.data?.collection;
						return col ? mapCollectionProductsToCards(col) : [];
					} catch {
						return allProducts;
					}
				}

				try {
					const { body } = await shopifyFetch<StorefrontProductsQueryData>({
						query: searchProductsQuery,
						variables: { query: shopifyQuery },
						language,
					});
					if (cancelled) return;

					const shopifyResults = mapStorefrontProductsToCards(body.data);

					// Shopify's search index only matches the store's DEFAULT language,
					// so Arabic terms (e.g. "جبيرة") return nothing here even though the
					// product displays in Arabic. Fall back to a client-side filter over
					// the already-localized product list when the native search is empty.
					if (shopifyResults.length === 0) {
						const source = await localFallbackSource();
						if (cancelled) return;
						setProducts(filterProductsLocally(source, debouncedSearchTrimmed));
					} else {
						setProducts(shopifyResults);
					}
				} catch {
					// Network/API failure — still try the local list so the user gets results.
					if (cancelled) return;
					const source = await localFallbackSource();
					if (cancelled) return;
					const local = filterProductsLocally(source, debouncedSearchTrimmed);
					if (local.length > 0) {
						setProducts(local);
					} else {
						setError(true);
					}
				} finally {
					if (!cancelled) setLoading(false);
				}
				return;
			}

			// Joint tag filter (from body-map deep link). Uses Shopify's `tag:`
			// search syntax; requires products to be tagged with the joint name.
			if (jointTag) {
				setLoading(true);
				const tagQuery = buildShopifyTagSearchQuery(
					jointTag,
					activeHandle === "all" ? null : activeHandle
				);
				try {
					const { body } = await shopifyFetch<StorefrontProductsQueryData>({
						query: searchProductsQuery,
						variables: { query: tagQuery },
						language,
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
					language,
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
	}, [activeHandle, debouncedSearchTrimmed, jointTag, allProducts, language]);

	function selectCollection(handle: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (handle === "all") {
			params.delete("collection");
		} else {
			params.set("collection", handle);
		}
		// Choosing a collection tab clears any body-map joint deep link.
		params.delete("joint");
		const qs = params.toString();
		router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
	}

	const isSearching = Boolean(debouncedSearchTrimmed);
	const isJointFiltering = Boolean(jointTag) && !isSearching;
	const showLoading = loading || isSearchPending;
	const emptyMessage =
		isSearching || isJointFiltering ? t("empty_search") : t("empty");
	const loadingMessage =
		isSearchPending || isSearching || isJointFiltering
			? t("searching")
			: t("loading");

	function clearJoint() {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("joint");
		const qs = params.toString();
		router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
	}

	function handleBodyPartSelect(bodyPart: BodyPart) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("joint", bodyPart.joint);
		// A body-part pick replaces any active free-text search.
		params.delete("search");
		setSearchInput("");
		setBodyMapOpen(false);
		const qs = params.toString();
		router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
	}

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
							className="h-11 pl-10 pr-10 border-2 text-xs placeholder:text-xs sm:text-sm sm:placeholder:text-sm placeholder:truncate [&::-webkit-search-cancel-button]:hidden"
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

					{isJointFiltering && (
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
								{t("filtering_by_joint", { joint: jointTag })}
								<button
									type="button"
									onClick={clearJoint}
									aria-label={t("clear_search")}
									className="hover:text-primary/70"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</span>
						</div>
					)}

					<div
						className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:scrollbar-hide"
						role="tablist"
						aria-label={t("filter_by_collection_aria")}
					>
						{/* <button
							type="button"
							role="tab"
							aria-selected={activeHandle === "all"}
							onClick={() => selectCollection("all")}
							className={cn(
								"flex items-center justify-center text-center px-4 py-3 sm:py-2 text-sm font-medium rounded-xl sm:rounded-full border transition-all duration-200 sm:shrink-0 sm:whitespace-nowrap",
								activeHandle === "all"
									? "bg-primary text-primary-foreground border-primary shadow-sm sm:scale-105"
									: "bg-transparent text-muted-foreground border-border hover:border-primary/60 hover:text-foreground"
							)}
						>
							{t("all")}
						</button> */}

						{collections.map((col) => (
							<button
								key={col.id}
								type="button"
								role="tab"
								aria-selected={activeHandle === col.handle}
								onClick={() => selectCollection(col.handle)}
								className={cn(
									"flex items-center justify-center text-center px-4 py-3 sm:py-2 text-sm font-medium rounded-xl sm:rounded-full border transition-all duration-200 sm:shrink-0 sm:whitespace-nowrap",
									activeHandle === col.handle
										? "bg-primary text-primary-foreground border-primary shadow-sm sm:scale-105"
										: "bg-transparent text-muted-foreground border-border hover:border-primary/60 hover:text-foreground"
								)}
							>
								{col.title}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Body-map filter — button sits below the tabs, opens the map in a modal */}
			<div className="container mx-auto px-4 pt-4">
				<button
					type="button"
					onClick={() => setBodyMapOpen(true)}
					className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
				>
					<PersonStanding className="h-4 w-4" />
					{t("filter_by_body_part")}
				</button>
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
					<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
						{products.map((product) => (
							<ShopifyProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>

			{/* Body-map filter modal */}
			<Dialog open={bodyMapOpen} onOpenChange={setBodyMapOpen}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>{t("body_map_title")}</DialogTitle>
						<DialogDescription>{t("body_map_subtitle")}</DialogDescription>
					</DialogHeader>
					<div className="mt-2">
						<InteractiveBodyMap
							onPartClick={handleBodyPartSelect}
							initialSelectedId={jointTag || undefined}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
}
