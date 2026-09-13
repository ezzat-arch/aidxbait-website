import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutHeaderSection } from "@/components/sections/about-header-section";
import { WhyDoctoorySection } from "@/components/sections/why-doctoory-section";
import { ContactSection } from "@/components/sections/contact-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "about.page.meta" });

	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			canonical: `/${locale}/about`,
			languages: {
				en: "/en/about",
				ar: "/ar/about",
			},
		},
	};
}

export default async function AboutPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="flex flex-col min-h-screen overflow-x-hidden max-w-full">
			<AboutHeaderSection />
			<main>
				<WhyDoctoorySection />
				<ContactSection />
			</main>
		</div>
	);
}
