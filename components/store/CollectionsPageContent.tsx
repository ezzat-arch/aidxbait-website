"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, AlertCircle, Layers } from "lucide-react";
import { ShopifyCollectionCard } from "@/components/store/ShopifyCollectionCard";
import type { ShopifyCollectionCardModel } from "@/lib/shopify/types";

type CollectionsPageContentProps = {
	collections: ShopifyCollectionCardModel[];
	errorMessage?: string | null;
};

export function CollectionsPageContent({
	collections,
	errorMessage,
}: CollectionsPageContentProps) {
	const t = useTranslations("store.CollectionsPage");

	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Hero */}
			<div className="relative min-h-[360px] sm:h-[40vh] overflow-hidden">
				<div className="absolute inset-0">
					<Image
						src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
						alt="Collections hero"
						fill
						priority
						className="object-cover"
						sizes="100vw"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70" />
				</div>

				{/* Decorative blobs */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
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

				<div className="relative h-full flex items-center justify-center py-16 px-4">
					<div className="text-center max-w-3xl mx-auto">
						<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
							<LayoutGrid className="h-4 w-4 text-white/90" />
							<span className="text-white/90 text-sm font-medium">
								{t("hero_badge")}
							</span>
						</div>

						<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-4">
							{t("hero_title")}
						</h1>

						<div className="flex items-center justify-center gap-3 mb-4">
							<div className="h-px w-16 bg-white/40" />
							<div className="w-2 h-2 rounded-full bg-white/60" />
							<div className="h-px w-16 bg-white/40" />
						</div>

						<p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto">
							{t("hero_subtitle")}
						</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 py-10">
				{/* Breadcrumb + back */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
					<nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
						<Link href="/services/store" className="hover:text-primary transition-colors">
							{t("breadcrumb_store")}
						</Link>
						<span>/</span>
						<span className="text-foreground font-medium">{t("breadcrumb_collections")}</span>
					</nav>

					<Button variant="ghost" size="sm" className="-ml-3 sm:ml-0 self-start" asChild>
						<Link href="/services/store">
							<ArrowLeft className="h-4 w-4 mr-2" />
							{t("back_to_store")}
						</Link>
					</Button>
				</div>

				{/* Count pill */}
				{!errorMessage && collections.length > 0 && (
					<div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium mb-6">
						<Layers className="h-4 w-4" />
						{t("items_count", { count: collections.length })}
					</div>
				)}

				{/* Error */}
				{errorMessage && (
					<div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-4 text-sm text-destructive mb-8 max-w-lg">
						<AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
						<div>
							<p className="font-semibold mb-1">{t("error_heading")}</p>
							<p>{errorMessage}</p>
						</div>
					</div>
				)}

				{/* Empty */}
				{!errorMessage && collections.length === 0 && (
					<div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
						<div className="rounded-full bg-muted p-6">
							<LayoutGrid className="h-10 w-10 text-muted-foreground" />
						</div>
						<h2 className="text-xl font-semibold">{t("empty_heading")}</h2>
						<p className="text-muted-foreground max-w-sm">{t("empty_body")}</p>
						<Button variant="outline" asChild>
							<Link href="/services/store">{t("back_to_store")}</Link>
						</Button>
					</div>
				)}

				{/* Grid */}
				{collections.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{collections.map((collection) => (
							<ShopifyCollectionCard key={collection.id} collection={collection} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
