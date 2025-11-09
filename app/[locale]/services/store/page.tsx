import { Suspense } from "react";
import { StoreContent } from "@/components/store/StoreContent";
import { setRequestLocale, getTranslations } from 'next-intl/server';

// Loading fallback component
async function StoreLoadingFallback() {
	const t = await getTranslations("store.StoreContent");
	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="flex items-center justify-center py-20">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">{t("loading.store")}</p>
				</div>
			</div>
		</div>
	);
}

export default async function StorePage({ 
	params 
}: { 
	params: Promise<{ locale: string }> 
}) {
	const { locale } = await params;
	
	// Enable static rendering
	setRequestLocale(locale);

	return (
		<Suspense fallback={<StoreLoadingFallback />}>
			<StoreContent />
		</Suspense>
	);
}

