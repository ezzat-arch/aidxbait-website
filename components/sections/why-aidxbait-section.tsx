"use client";

import { HoverEffect } from "@/components/ui/card-hover-effect";
import { useTranslations } from "next-intl";

const buildWhyItems = (tTitle: ReturnType<typeof useTranslations>, tDesc: ReturnType<typeof useTranslations>) => [
	{
		title: tTitle("less_than_24_hour_response"),
		description: tDesc("get_connected_to_healthcare_professionals"),
		link: "#response",
	},
	{
		title: tTitle("licensed_professionals"),
		description: tDesc("all_our_healthcare_providers_are"),
		link: "#licensed",
	},
	{
		title: tTitle("cairo_giza_and_more"),
		description: tDesc("comprehensive_coverage_across_cairo_giza"),
		link: "#coverage",
	},
	{
		title: tTitle("everything_in_one_app"),
		description: tDesc("book_appointments_track_health_records"),
		link: "#app",
	},
];

export function WhyAidXBaitSection() {
	const tText = useTranslations("sections.why.text");
	const tTitle = useTranslations("sections.why.data.title");
	const tDesc = useTranslations("sections.why.data.description");
	const whyItems = buildWhyItems(tTitle, tDesc);
	return (
		<section className="py-20 bg-gray-50 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
						{tText("why_choose_aidxbait")}
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
						{tText("bringing_hospital_care_quality_to")}
					</p>
				</div>
				<div className="max-w-5xl mx-auto px-2">
					<HoverEffect items={whyItems} />
				</div>
			</div>
		</section>
	);
}
