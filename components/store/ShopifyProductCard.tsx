"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ShopifyProductCardModel } from "@/lib/shopify/types";
import { useLocale, useTranslations } from "next-intl";
import { DEFAULT_CURRENCY } from "@/lib/i18n/utils";

function formatPrice(amount: string, currencyCode: string, locale: string) {
	const n = Number.parseFloat(amount);
	if (Number.isNaN(n)) return `${amount} ${currencyCode}`;
	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency: currencyCode,
		}).format(n);
	} catch {
		return `${n.toFixed(2)} ${currencyCode}`;
	}
}

type ShopifyProductCardProps = {
	product: ShopifyProductCardModel;
	className?: string;
};

export function ShopifyProductCard({ product, className }: ShopifyProductCardProps) {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("store.StoreShopifyContent");
	// Trailing slash matches next.config trailingSlash; encode handle for URL safety
	const detailHref = `/services/store/products/${encodeURIComponent(product.handle)}/`;
	const priceLabel = formatPrice(product.priceAmount, DEFAULT_CURRENCY, locale);
	const compareLabel =
		product.compareAtAmount != null
			? formatPrice(product.compareAtAmount, DEFAULT_CURRENCY, locale)
			: null;
	const isUnavailable = !product.availableForSale;

	return (
		<Card
			className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className ?? ""}`}
		>
			<div className="relative aspect-square overflow-hidden bg-muted">
				{product.imageUrl ? (
					<Image
						src={product.imageUrl}
						alt={product.imageAlt ?? product.title}
						fill
						className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
							isUnavailable ? "opacity-60 grayscale" : ""
						}`}
						sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
						{t("no_image")}
					</div>
				)}

				{/* Discount badge (top-start) */}
				{product.discountPercent != null && (
					<Badge
						variant="destructive"
						className="absolute top-3 ltr:left-3 rtl:right-3 shadow-lg font-semibold"
					>
						{t("save_percent", { percent: product.discountPercent })}
					</Badge>
				)}

				{/* Unavailable overlay */}
				{isUnavailable && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/40">
						<span className="rounded-full bg-background/90 px-4 py-1.5 text-sm font-semibold text-foreground shadow-lg ring-1 ring-border backdrop-blur-sm">
							{t("currently_unavailable")}
						</span>
					</div>
				)}
			</div>

			<CardContent className="p-4">
				<h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
					{product.title}
				</h3>
				<p className="text-sm text-muted-foreground line-clamp-2 mb-1">
					{product.descriptionPlain ?? t("no_description")}
				</p>
				<div className="flex items-baseline gap-2">
					<p className="text-lg font-bold text-primary">{priceLabel}</p>
					{compareLabel && (
						<p className="text-sm text-muted-foreground line-through">
							{compareLabel}
						</p>
					)}
				</div>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button
					type="button"
					variant={isUnavailable ? "outline" : "default"}
					size="sm"
					className="w-full"
					onClick={() => router.push(detailHref)}
				>
					{isUnavailable ? t("currently_unavailable") : t("view_details")}
				</Button>
			</CardFooter>
		</Card>
	);
}
