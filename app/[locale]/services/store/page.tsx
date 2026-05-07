import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { shopifyFetch } from "@/lib/shopify";
import { getAllProductsQuery } from "@/lib/shopify/queries/products";
import { mapStorefrontProductsToCards } from "@/lib/shopify/map-storefront-products";
import type { StorefrontProductsQueryData } from "@/lib/shopify/types";
import { StoreShopifyContent } from "@/components/store/StoreShopifyContent";
import { CollectionsFilterSection } from "@/components/store/CollectionsFilterSection";
import { StoreCollectionsContent } from "@/components/store/StoreCollectionsContent";
import { getShopifyCollections } from "@/lib/shopify/get-collections";

async function StoreProductsWithFilter({ locale }: { locale: string }) {
	const [collectionsResult, productsResult] = await Promise.allSettled([
		getShopifyCollections(),
		shopifyFetch<StorefrontProductsQueryData>({ query: getAllProductsQuery }).then(
			({ body }) => mapStorefrontProductsToCards(body.data)
		),
	]);

	const collections =
		collectionsResult.status === "fulfilled" ? collectionsResult.value : [];
	const allProducts =
		productsResult.status === "fulfilled" ? productsResult.value : [];

	return (
		<CollectionsFilterSection collections={collections} allProducts={allProducts} />
	);
}

async function StoreCollectionsSection({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: "store.StoreCollectionsContent" });

	try {
		const collections = await getShopifyCollections();
		return <StoreCollectionsContent collections={collections} />;
	} catch {
		return (
			<StoreCollectionsContent collections={[]} errorMessage={t("fetch_failed")} />
		);
	}
}

async function StoreLoadingFallback() {
	const t = await getTranslations("store.StoreContent");
	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
					<p className="text-muted-foreground">{t("loading.store")}</p>
				</div>
			</div>
		</div>
	);
}

export default async function StorePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<Suspense fallback={<StoreLoadingFallback />}>
			<StoreShopifyContent products={[]} heroOnly />
			<StoreProductsWithFilter locale={locale} />
			<StoreCollectionsSection locale={locale} />
		</Suspense>
	);
}
