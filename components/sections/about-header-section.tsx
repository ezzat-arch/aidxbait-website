"use client";

import { HeartPulse, ShieldCheck, Smartphone, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const PILLARS = [
	{ key: "devices", icon: Stethoscope },
	{ key: "consultations", icon: Smartphone },
	{ key: "home_visits", icon: HeartPulse },
	{ key: "privacy", icon: ShieldCheck },
] as const;

export function AboutHeaderSection() {
	const t = useTranslations("about.page.text");
	const tNav = useTranslations("ui.navbar.text");

	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/40 pt-40 pb-16 md:pt-48 md:pb-20">
			{/* Decorative blobs, purely visual */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 ltr:-right-24 rtl:-left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 ltr:-left-32 rtl:-right-32 h-72 w-72 rounded-full bg-secondary/20 blur-3xl"
			/>

			<div className="container relative z-10 mx-auto px-6 md:px-10">
				<motion.div
					initial={{ opacity: 0, y: 28 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					viewport={{ once: true, amount: 0.4 }}
					className="max-w-3xl"
				>
					<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
						{t("eyebrow")}
					</span>

					<h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
						{tNav("about")}
					</h1>

					{/* The full description previously lived in the navbar dropdown. */}
					<p className="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl">
						{tNav("about_description")}
					</p>
				</motion.div>

				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{PILLARS.map((pillar, index) => {
						const Icon = pillar.icon;
						return (
							<motion.div
								key={pillar.key}
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.5,
									delay: 0.05 * (index + 1),
									ease: "easeOut",
								}}
								viewport={{ once: true, amount: 0.3 }}
								className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
							>
								<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
									<Icon className="h-5 w-5" aria-hidden="true" />
								</span>
								<h2 className="mt-4 text-base font-semibold text-gray-900">
									{t(`pillar_${pillar.key}_title`)}
								</h2>
								<p className="mt-2 text-sm leading-relaxed text-gray-600">
									{t(`pillar_${pillar.key}_description`)}
								</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
