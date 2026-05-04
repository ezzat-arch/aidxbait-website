"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import type { ShopifyProductCardModel } from "@/lib/shopify/types";

type StoreShopifyContentProps = {
	products: ShopifyProductCardModel[];
	errorMessage?: string | null;
};

export function StoreShopifyContent({
	products,
	errorMessage,
}: StoreShopifyContentProps) {
	const t = useTranslations("store.StoreContent");
	const tShopify = useTranslations("store.StoreShopifyContent");

	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Hero — aligned with StoreContent */}
			<div className="relative min-h-[400px] sm:h-[45vh] md:h-[50vh] lg:h-[40vh] max-h-[600px] overflow-hidden">
				<div className="absolute inset-0">
					<Image
						src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
						alt="Store hero background"
						fill
						className="object-cover"
						sizes="100vw"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70" />
				</div>

				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
					<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
					<div
						className="absolute inset-0 opacity-10"
						style={{
							backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
							backgroundSize: "40px 40px",
						}}
					/>
				</div>

				<div className="relative h-full flex items-center justify-center">
					<div className="text-center px-4 max-w-5xl mx-auto">
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
							<span className="text-white/90 text-sm font-medium">
								{t("hero.badge")}
							</span>
							<span className="text-white">✓</span>
						</div>

						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white drop-shadow-2xl mb-4 sm:mb-6">
							{t("hero.title")}
						</h1>

						<div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
							<div className="h-px w-16 bg-white/40" />
							<div className="w-2 h-2 rounded-full bg-white/60" />
							<div className="h-px w-16 bg-white/40" />
						</div>

						<p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto">
							{tShopify("hero.subtitle")}
						</p>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-8">
				{errorMessage && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-8">
						{errorMessage}
					</div>
				)}

				{!errorMessage && products.length === 0 && (
					<div className="flex flex-col items-center justify-center py-16 px-4">
						<p className="text-muted-foreground text-lg text-center max-w-md">
							{tShopify("empty_catalog")}
						</p>
					</div>
				)}

				{products.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map((product) => (
							<ShopifyProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
