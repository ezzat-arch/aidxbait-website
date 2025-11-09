import { StoreContent } from "@/components/store/StoreContent";
import { setRequestLocale } from 'next-intl/server';

export default async function StorePage({ 
	params 
}: { 
	params: Promise<{ locale: string }> 
}) {
	const { locale } = await params;
	
	// Enable static rendering
	setRequestLocale(locale);

	return <StoreContent />;
}

