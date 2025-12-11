import { setRequestLocale, getTranslations } from "next-intl/server";
import { ServiceComingSoon } from "@/components/sections/service-coming-soon";

export default async function OnlineConsultationsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Enable static rendering
	setRequestLocale(locale);

	const t = await getTranslations("services.online_consultations");

	return (
		<ServiceComingSoon serviceName={t("name")} description={t("description")} />
	);
}
