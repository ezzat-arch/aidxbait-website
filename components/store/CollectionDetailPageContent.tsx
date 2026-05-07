"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Package, Tag } from "lucide-react";
import type { StorefrontCollectionByHandleData } from "@/lib/shopify/types";

type Collection = NonNullable<StorefrontCollectionByHandleData["collection"]>;
type Product = Collection["products"]["edges"][number]["node"];

function formatPrice(amount: string, currencyCode: string, locale: string) {
	const n = Number.parseFloat(amount);
	if (Number.isNaN(n)) return `${amount} ${currencyCode}`;
	try {
		return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
			style: "currency",
			currency: currencyCode,
		}).format(n);
	} catch {
		return `${n.toFixed(2)} ${currencyCode}`;
	}
}

function CollectionProductCard({ product }: { product: Product }) {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("store.CollectionDetailPage");

	const imgNode = product.images.edges[0]?.node;
	const price = product.priceRange.minVariantPrice;
	const href = `/services/store/products/${encodeURIComponent(product.handle)}/`;

	return (
		<Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-card">
			<div className="relative aspect-square overflow-hidden bg-muted">
				{imgNode ? (
					<Image
						src={imgNode.url}
						alt={imgNode.altText ?? product.title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-110"
						sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
						<Package className="h-10 w-10 text-muted-foreground/40" />
					</div>
				)}
			</div>

			<CardContent className="p-4 pb-2">
				<h3 className="font-semibold text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
					{product.title}
				</h3>
				<p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-2">
					{product.description?.trim() || t("no_image")}
				</p>
				<p className="text-lg font-bold text-primary">
					{formatPrice(price.amount, price.currencyCode, locale)}
				</p>
			</CardContent>

			<CardFooter className="p-4 pt-2">
				<Button
					type="button"
					size="sm"
					className="w-full"
					onClick={() => router.push(href)}
				>
					{t("view_details")}
				</Button>
			</CardFooter>
		</Card>
	);
}

type CollectionDetailPageContentProps = {
	collection: Collection;
};

export function CollectionDetailPageContent({
	collection,
}: CollectionDetailPageContentProps) {
	const t = useTranslations("store.CollectionDetailPage");
	const products = collection.products.edges.map((e) => e.node);

	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Collection hero */}
			<div className="relative min-h-[300px] sm:h-[38vh] overflow-hidden">
				{collection.image ? (
					<>
						<Image
							src={collection.image.url}
							alt={collection.image.altText ?? collection.title}
							fill
							priority
							className="object-cover"
							sizes="100vw"
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
					</>
				) : (
					<div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70" />
				)}

				{/* Dot grid */}
				<div
					className="absolute inset-0 opacity-10 pointer-events-none"
					style={{
						backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
						backgroundSize: "40px 40px",
					}}
				/>

				<div className="relative h-full flex items-end pb-8 px-4 sm:px-8 lg:px-16 py-14">
					<div className="max-w-3xl">
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-xs text-white/90 font-medium mb-4">
							<Tag className="h-3.5 w-3.5" />
							{t("products_count", { count: products.length })}
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-3">
							{collection.title}
						</h1>
						{collection.description && (
							<p className="text-white/80 text-sm sm:text-base max-w-xl line-clamp-3">
								{collection.description}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 py-10">
				{/* Breadcrumb + back */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
					<nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
						<Link href="/services/store" className="hover:text-primary transition-colors">
							{t("breadcrumb_store")}
						</Link>
						<span>/</span>
						<Link href="/services/store/collections" className="hover:text-primary transition-colors">
							{t("breadcrumb_collections")}
						</Link>
						<span>/</span>
						<span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
							{collection.title}
						</span>
					</nav>

					<Button variant="ghost" size="sm" className="-ml-3 sm:ml-0 self-start shrink-0" asChild>
						<Link href="/services/store/collections">
							<ArrowLeft className="h-4 w-4 mr-2" />
							{t("back_to_collections")}
						</Link>
					</Button>
				</div>

				{/* Empty state */}
				{products.length === 0 && (
					<div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
						<div className="rounded-full bg-muted p-6">
							<Package className="h-10 w-10 text-muted-foreground" />
						</div>
						<h2 className="text-xl font-semibold">{t("empty_heading")}</h2>
						<p className="text-muted-foreground max-w-sm">{t("empty_body")}</p>
						<Button variant="outline" asChild>
							<Link href="/services/store/collections">{t("back_to_collections")}</Link>
						</Button>
					</div>
				)}

				{/* Products grid */}
				{products.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map((product) => (
							<CollectionProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
