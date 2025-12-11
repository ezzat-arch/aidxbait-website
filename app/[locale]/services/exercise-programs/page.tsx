import { setRequestLocale, getTranslations } from "next-intl/server";
import { ServiceComingSoon } from "@/components/sections/service-coming-soon";

export default async function ExerciseProgramsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Enable static rendering
	setRequestLocale(locale);

	const t = await getTranslations("services.exercise_programs");

	return (
		<ServiceComingSoon serviceName={t("name")} description={t("description")} />
	);
}
