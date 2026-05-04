import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { shopifyFetch } from "@/lib/shopify";
import { getAllProductsQuery } from "@/lib/shopify/queries/products";
import { mapStorefrontProductsToCards } from "@/lib/shopify/map-storefront-products";
import type { StorefrontProductsQueryData } from "@/lib/shopify/types";
import { StoreShopifyContent } from "@/components/store/StoreShopifyContent";

async function StoreShopifyProductsSection({ locale }: { locale: string }) {
	const t = await getTranslations({ locale, namespace: "store.StoreShopifyContent" });

	try {
		const { body } = await shopifyFetch<StorefrontProductsQueryData>({
			query: getAllProductsQuery,
		});
		const products = mapStorefrontProductsToCards(body.data);
		return <StoreShopifyContent products={products} />;
	} catch {
		return (
			<StoreShopifyContent products={[]} errorMessage={t("fetch_failed")} />
		);
	}
}

// Loading fallback component
async function StoreLoadingFallback() {
	const t = await getTranslations("store.StoreContent");
	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
			<StoreShopifyProductsSection locale={locale} />
		</Suspense>
	);
}
