import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionsPageContent } from "@/components/store/CollectionsPageContent";
import { getShopifyCollections } from "@/lib/shopify/get-collections";

interface CollectionsPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: CollectionsPageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "store.CollectionsPage" });

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const pageUrl = `${baseUrl}/${locale}/services/store/collections/`;

	return {
		title: t("meta_title"),
		description: t("meta_description"),
		openGraph: {
			title: t("meta_title"),
			description: t("meta_description"),
			url: pageUrl,
			siteName: "Doctoory",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: t("meta_title"),
			description: t("meta_description"),
		},
		alternates: {
			canonical: pageUrl,
		},
	};
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: "store.CollectionsPage" });
	const tContent = await getTranslations({ locale, namespace: "store.StoreCollectionsContent" });

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const pageUrl = `${baseUrl}/${locale}/services/store/collections/`;

	let collections = await getShopifyCollections().catch(() => null);
	const fetchFailed = collections === null;
	if (fetchFailed) collections = [];

	const errorMessage = fetchFailed ? tContent("fetch_failed") : null;

	const breadcrumbData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: baseUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: t("breadcrumb_store"),
				item: `${baseUrl}/${locale}/services/store/`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: t("breadcrumb_collections"),
				item: pageUrl,
			},
		],
	};

	const collectionListData =
		collections.length > 0
			? {
					"@context": "https://schema.org",
					"@type": "ItemList",
					name: t("hero_title"),
					url: pageUrl,
					numberOfItems: collections.length,
					itemListElement: collections.map((c, i) => ({
						"@type": "ListItem",
						position: i + 1,
						name: c.title,
						url: `${baseUrl}/${locale}/services/store/collections/${encodeURIComponent(c.handle)}/`,
						image: c.imageUrl ?? undefined,
					})),
				}
			: null;

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
			/>
			{collectionListData && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionListData) }}
				/>
			)}

			<CollectionsPageContent
				collections={collections}
				errorMessage={errorMessage}
			/>
		</>
	);
}
