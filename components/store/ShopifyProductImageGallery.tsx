"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export type ShopifyGalleryImage = {
	url: string;
	altText: string | null;
};

type ShopifyProductImageGalleryProps = {
	images: ShopifyGalleryImage[];
	productTitle: string;
	isInStock: boolean;
};

export function ShopifyProductImageGallery({
	images,
	productTitle,
	isInStock,
}: ShopifyProductImageGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const t = useTranslations("store.ProductCard.text");
	const tShopify = useTranslations("store.StoreShopifyContent");
	const safeImages =
		images.length > 0 ? images : [{ url: "", altText: productTitle }];

	const current = safeImages[selectedIndex] ?? safeImages[0];

	return (
		<div className="space-y-4">
			<div className="relative aspect-square overflow-hidden rounded-lg border-2 border-border/50 shadow-lg bg-muted">
				{current.url ? (
					<Image
						src={current.url}
						alt={current.altText ?? productTitle}
						fill
						className="object-cover"
						priority
						sizes="(min-width: 1024px) 50vw, 100vw"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-muted-foreground text-sm px-4 text-center">
						{tShopify("no_image")}
					</div>
				)}

				{!isInStock && current.url && (
					<Badge
						variant="outline"
						className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm shadow-lg"
					>
						{t("out_of_stock")}
					</Badge>
				)}
			</div>

			{images.length > 1 && (
				<div className="grid grid-cols-5 gap-2">
					{images.map((img, i) => (
						<button
							key={`${img.url}-${i}`}
							type="button"
							onClick={() => setSelectedIndex(i)}
							className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
								i === selectedIndex
									? "border-primary ring-2 ring-primary/20"
									: "border-transparent opacity-70 hover:opacity-100"
							}`}
						>
							<Image
								src={img.url}
								alt={img.altText ?? productTitle}
								fill
								className="object-cover"
								sizes="80px"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
