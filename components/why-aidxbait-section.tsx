"use client";

import { HoverEffect } from "./ui/card-hover-effect";
import { Clock, Users, MapPin, Smartphone } from "lucide-react";

const whyItems = [
	{
		title: "24-Hour Response",
		description:
			"Get connected to healthcare professionals within hours, not days. Our rapid response system ensures you receive care when you need it most.",
		link: "#response",
	},
	{
		title: "Licensed Professionals",
		description:
			"All our healthcare providers are fully licensed, experienced professionals committed to delivering the highest quality care in your home.",
		link: "#licensed",
	},
	{
		title: "Cairo, Giza & More",
		description:
			"Comprehensive coverage across Cairo, Giza, and expanding regions. Bringing professional healthcare directly to your doorstep.",
		link: "#coverage",
	},
	{
		title: "Everything in One App",
		description:
			"Book appointments, track health records, communicate with providers, and manage prescriptions all from one powerful, easy-to-use app.",
		link: "#app",
	},
];

export function WhyAidXBaitSection() {
	return (
		<section className="py-20 bg-gray-50 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
						Why Choose AidXBait?
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
						Bringing Hospital-Care quality to your home
					</p>
				</div>
				<div className="max-w-5xl mx-auto px-2">
					<HoverEffect items={whyItems} />
				</div>
			</div>
		</section>
	);
}
