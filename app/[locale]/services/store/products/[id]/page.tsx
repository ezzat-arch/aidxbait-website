import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import {
	ArrowLeft,
	Check,
	Info,
	Package,
	RotateCcw,
	Shield,
	Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { ShopifyProductImageGallery } from "@/components/store/ShopifyProductImageGallery";
import {
	getShopifyProductByHandle,
	getShopifyRelatedProductCards,
} from "@/lib/shopify/get-product-by-handle";
import { DEFAULT_CURRENCY } from "@/lib/i18n/utils";
/** URL segment `[id]` is the Shopify product handle (slug), e.g. `knee-support-brace`. */
interface ProductPageProps {
	params: Promise<{
		locale: string;
		id: string;
	}>;
}

function stripScriptsFromHtml(html: string): string {
	return html.replace(/<script\b[\s\S]*?<\/script>/gi, "");
}

function formatMoney(
	amount: string,
	currencyCode: string,
	locale: string
): string {
	const n = Number.parseFloat(amount);
	if (Number.isNaN(n)) return `${amount} ${currencyCode}`;
	try {
		return new Intl.NumberFormat(
			locale === "ar" ? "ar-EG" : "en-US",
			{ style: "currency", currency: currencyCode }
		).format(n);
	} catch {
		return `${n.toFixed(2)} ${currencyCode}`;
	}
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { locale, id: handleParam } = await params;
	const product = await getShopifyProductByHandle(handleParam, locale);

	if (!product) {
		const t = await getTranslations({
			locale,
			namespace: "store.StoreShopifyContent",
		});
		return {
			title: t("product_not_found_title"),
		};
	}

	const plain =
		stripScriptsFromHtml(product.descriptionHtml)
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 155) || product.title;

	const firstImage = product.images.edges[0]?.node?.url;
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const productPath = `/${locale}/services/store/products/${encodeURIComponent(handleParam)}/`;
	const productUrl = `${baseUrl}${productPath}`;

	return {
		title: `${product.title} | Doctoory Store`,
		description: plain,
		openGraph: {
			title: product.title,
			description: plain,
			url: productUrl,
			siteName: "Doctoory",
			images: firstImage
				? [{ url: firstImage, width: 800, height: 800, alt: product.title }]
				: [],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: product.title,
			description: plain,
			images: firstImage ? [firstImage] : [],
		},
		alternates: {
			canonical: productUrl,
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { locale, id: handleParam } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({
		locale,
		namespace: "store.StoreShopifyContent",
	});
	const tDetail = await getTranslations({
		locale,
		namespace: "store.ProductDetail.text",
	});
	const tCommon = await getTranslations({ locale, namespace: "common.text" });
	const tFooter = await getTranslations({
		locale,
		namespace: "layout.footer.text",
	});
	const tBreadcrumb = await getTranslations({
		locale,
		namespace: "ui.breadcrumb.attr.aria-label",
	});

	const product = await getShopifyProductByHandle(handleParam, locale);
	if (!product) {
		notFound();
	}

	const related = await getShopifyRelatedProductCards(handleParam, 4, locale);

	const galleryImages = product.images.edges.map((e) => ({
		url: e.node.url,
		altText: e.node.altText,
	}));

	const variantNode = product.variants.edges[0]?.node;
	const isInStock = variantNode?.availableForSale ?? false;
	const priceLabel = formatMoney(
		product.priceRange.minVariantPrice.amount,
		DEFAULT_CURRENCY,
		locale
	);

	const variantId = variantNode?.id ?? "";
	const shopifyConfigured = Boolean(
		process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN &&
			process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN
	);

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const productPath = `/${locale}/services/store/products/${encodeURIComponent(handleParam)}/`;
	const productUrl = `${baseUrl}${productPath}`;

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		image: galleryImages.map((i) => i.url).filter(Boolean),
		description: stripScriptsFromHtml(product.descriptionHtml)
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 500),
		offers: {
			"@type": "Offer",
			url: productUrl,
			priceCurrency: DEFAULT_CURRENCY,
			price: product.priceRange.minVariantPrice.amount,
			availability: isInStock
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
			itemCondition: "https://schema.org/NewCondition",
		},
	};

	const breadcrumbData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: tFooter("home"),
				item: baseUrl,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: tCommon("store"),
				item: `${baseUrl}/${locale}/services/store/`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: product.title,
				item: productUrl,
			},
		],
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
			/>

			<div className="min-h-screen bg-background pt-40">
				<div className="container mx-auto px-4 py-8">
					<nav
						aria-label={tBreadcrumb("breadcrumb")}
						className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
					>
						<Link href="/services/store" className="hover:text-primary">
							{tCommon("store")}
						</Link>
						<span>/</span>
						<span className="text-foreground line-clamp-1">{product.title}</span>
					</nav>

					<Button variant="ghost" className="mb-6 -ml-4" asChild>
						<Link href="/services/store">
							<ArrowLeft className="h-4 w-4 mr-2" />
							{t("back_to_store")}
						</Link>
					</Button>

					<article className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
						<ShopifyProductImageGallery
							images={galleryImages}
							productTitle={product.title}
							isInStock={isInStock}
						/>

						<div className="space-y-6">
							<header>
								<h1 className="text-4xl font-bold mb-4">{product.title}</h1>

								<div className="flex items-baseline gap-3 mb-4">
									<span className="text-4xl font-bold text-primary">
										{priceLabel}
									</span>
								</div>

								<div className="mb-6">
									{isInStock ? (
										<div className="flex items-center gap-2 text-green-600">
											<Check className="h-5 w-5" />
											<span className="font-medium">{tDetail("in_stock")}</span>
										</div>
									) : (
										<div className="flex items-center gap-2 text-destructive">
											<Info className="h-5 w-5" />
											<span className="font-medium">{tDetail("currently_unavailable")}</span>
										</div>
									)}
								</div>

								<div
									className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground"
									// Shopify admin HTML — scripts stripped server-side
									dangerouslySetInnerHTML={{
										__html: stripScriptsFromHtml(product.descriptionHtml),
									}}
								/>
							</header>

							{shopifyConfigured && variantId ? (
								<AddToCartButton
									variantId={variantId}
									text={t("buy_on_shopify")}
									disabled={!isInStock}
								/>
							) : (
								<p className="text-sm text-muted-foreground">{t("configure_domain")}</p>
							)}

							<Card className="border-2">
								<CardContent className="p-0">
									<div className="grid grid-cols-3 divide-x">
										<div className="flex flex-col items-center text-center p-4">
											<Shield className="h-7 w-7 text-primary mb-2" />
											<span className="text-sm font-medium">
												{tDetail("quality_guaranteed")}
											</span>
										</div>
										<div className="flex flex-col items-center text-center p-4">
											<Truck className="h-7 w-7 text-primary mb-2" />
											<span className="text-sm font-medium">{tDetail("fast_shipping")}</span>
										</div>
										<div className="flex flex-col items-center text-center p-4">
											<RotateCcw className="h-7 w-7 text-primary mb-2" />
											<span className="text-sm font-medium">{tDetail("easy_returns")}</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-muted/30">
								<CardContent className="p-4 space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<Package className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">
											{tDetail("product_id")}{" "}
											<span className="font-mono text-xs break-all">
												{product.id}
											</span>
										</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</article>

					{related.length > 0 && (
						<section aria-labelledby="related-heading">
							<div className="flex items-center justify-between mb-6">
								<h2 id="related-heading" className="text-3xl font-bold">
									{t("related_heading")}
								</h2>
								<Link href="/services/store">
									<Button variant="ghost">
										{t("view_all_store")}
										<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
									</Button>
								</Link>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								{related.map((p) => (
									<Card
										key={p.id}
										className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
									>
										<Link
											href={`/services/store/products/${encodeURIComponent(p.handle)}/`}
										>
											<div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
												{p.imageUrl ? (
													<Image
														src={p.imageUrl}
														alt={p.imageAlt ?? p.title}
														fill
														className="object-cover transition-transform group-hover:scale-105"
														sizes="(min-width: 1024px) 25vw, 50vw"
													/>
												) : (
													<div className="flex h-full items-center justify-center text-muted-foreground text-sm p-2 text-center">
														{t("no_image")}
													</div>
												)}
											</div>
											<CardContent className="p-4">
												<h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
													{p.title}
												</h3>
												<div className="flex items-center gap-2">
													<span className="font-bold text-primary text-lg">
														{formatMoney(
															p.priceAmount,
															p.currencyCode,
															locale
														)}
													</span>
												</div>
											</CardContent>
										</Link>
									</Card>
								))}
							</div>
						</section>
					)}
				</div>
			</div>
		</>
	);
}
