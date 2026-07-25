import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CollectionDetailPageContent } from "@/components/store/CollectionDetailPageContent";
import { getShopifyCollectionByHandle } from "@/lib/shopify/get-collections";
import { DEFAULT_CURRENCY } from "@/lib/i18n/utils";

interface CollectionDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
	params,
}: CollectionDetailPageProps): Promise<Metadata> {
	const { locale, slug } = await params;
	const collection = await getShopifyCollectionByHandle(slug, locale);

	if (!collection) {
		const t = await getTranslations({ locale, namespace: "store.CollectionDetailPage" });
		return { title: t("not_found_title") };
	}

	const t = await getTranslations({ locale, namespace: "store.CollectionDetailPage" });
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const pageUrl = `${baseUrl}/${locale}/services/store/collections/${encodeURIComponent(slug)}/`;

	const description = collection.description?.trim()
		? collection.description.slice(0, 155)
		: t("meta_description", { title: collection.title });

	return {
		title: t("meta_title", { title: collection.title }),
		description,
		openGraph: {
			title: collection.title,
			description,
			url: pageUrl,
			siteName: "Doctoory",
			images: collection.image
				? [{ url: collection.image.url, alt: collection.image.altText ?? collection.title }]
				: [],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: collection.title,
			description,
			images: collection.image ? [collection.image.url] : [],
		},
		alternates: {
			canonical: pageUrl,
		},
	};
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
	const { locale, slug } = await params;
	setRequestLocale(locale);

	const collection = await getShopifyCollectionByHandle(slug, locale);
	if (!collection) notFound();

	const t = await getTranslations({ locale, namespace: "store.CollectionDetailPage" });
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const pageUrl = `${baseUrl}/${locale}/services/store/collections/${encodeURIComponent(slug)}/`;

	const breadcrumbData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: t("breadcrumb_home"), item: baseUrl },
			{ "@type": "ListItem", position: 2, name: t("breadcrumb_store"), item: `${baseUrl}/${locale}/services/store/` },
			{ "@type": "ListItem", position: 3, name: t("breadcrumb_collections"), item: `${baseUrl}/${locale}/services/store/collections/` },
			{ "@type": "ListItem", position: 4, name: collection.title, item: pageUrl },
		],
	};

	const products = collection.products.edges.map((e) => e.node);
	const collectionPageData = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: collection.title,
		description: collection.description || undefined,
		url: pageUrl,
		image: collection.image?.url || undefined,
		numberOfItems: products.length,
		hasPart: products.map((p) => ({
			"@type": "Product",
			name: p.title,
			url: `${baseUrl}/${locale}/services/store/products/${encodeURIComponent(p.handle)}/`,
			image: p.images.edges[0]?.node.url || undefined,
			offers: {
				"@type": "Offer",
				price: p.priceRange.minVariantPrice.amount,
				priceCurrency: DEFAULT_CURRENCY,
			},
		})),
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageData) }}
			/>
			<CollectionDetailPageContent collection={collection} />
		</>
	);
}
