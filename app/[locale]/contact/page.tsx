import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactHeaderSection } from "@/components/sections/contact-header-section";
import { ContactSection } from "@/components/sections/contact-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "contact.page.meta" });

	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			canonical: `/${locale}/contact`,
			languages: {
				en: "/en/contact",
				ar: "/ar/contact",
			},
		},
	};
}

export default async function ContactPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="flex flex-col min-h-screen overflow-x-hidden max-w-full">
			<ContactHeaderSection />
			<main>
				<ContactSection />
			</main>
		</div>
	);
}
