"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ShopifyProductCardModel } from "@/lib/shopify/types";
import { useLocale, useTranslations } from "next-intl";

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
	const priceLabel = formatPrice(
		product.priceAmount,
		product.currencyCode,
		locale
	);

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
						className="object-cover transition-transform duration-300 group-hover:scale-105"
						sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
						{t("no_image")}
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
				<p className="text-lg font-bold text-primary">{priceLabel}</p>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button
					type="button"
					variant="default"
					size="sm"
					className="w-full"
					onClick={() => router.push(detailHref)}
				>
					{t("view_details")}
				</Button>
			</CardFooter>
		</Card>
	);
}
