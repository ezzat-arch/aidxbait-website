"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { ShopifyCollectionCardModel } from "@/lib/shopify/types";

type ShopifyCollectionCardProps = {
	collection: ShopifyCollectionCardModel;
	className?: string;
};

export function ShopifyCollectionCard({
	collection,
	className,
}: ShopifyCollectionCardProps) {
	const router = useRouter();
	const t = useTranslations("store.StoreCollectionsContent");

	const href = `/services/store/collections/${encodeURIComponent(collection.handle)}/`;

	return (
		<Card
			className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-card ${className ?? ""}`}
		>
			{/* Image */}
			<div className="relative aspect-[4/3] overflow-hidden bg-muted">
				{collection.imageUrl ? (
					<Image
						src={collection.imageUrl}
						alt={collection.imageAlt ?? collection.title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-110"
						sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
						<span className="text-4xl opacity-30">🗂️</span>
					</div>
				)}

				{/* Gradient overlay always visible at bottom */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

				{/* Title pinned to bottom of image */}
				<div className="absolute bottom-0 left-0 right-0 p-4">
					<h3 className="font-bold text-lg text-white drop-shadow-md line-clamp-1 group-hover:text-primary-foreground transition-colors">
						{collection.title}
					</h3>
				</div>
			</div>

			<CardContent className="p-4 pb-2">
				<p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
					{collection.description ?? t("no_description")}
				</p>
			</CardContent>

			<CardFooter className="p-4 pt-2">
				<Button
					type="button"
					variant="default"
					size="sm"
					className="w-full gap-2 group/btn"
					onClick={() => router.push(href)}
				>
					{t("browse_collection")}
					<ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
				</Button>
			</CardFooter>
		</Card>
	);
}
