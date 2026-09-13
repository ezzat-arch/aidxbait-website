"use client";

import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
	SITE_ADDRESS_MAPS_HREF,
	SITE_EMAIL,
	SITE_EMAIL_HREF,
	SITE_PHONE,
	SITE_PHONE_TEL_HREF,
	SITE_WHATSAPP,
	SITE_WHATSAPP_CHAT_HREF,
} from "@/lib/site-contact";

function WhatsAppIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
		</svg>
	);
}

type QuickCardProps = {
	icon: ReactNode;
	label: string;
	value: string;
	hint: string;
	href: string;
	external?: boolean;
	/** Phone numbers, emails and URLs must read left to right even in Arabic. */
	ltrValue?: boolean;
	iconClassName?: string;
	delay?: number;
};

function QuickCard({
	icon,
	label,
	value,
	hint,
	href,
	external = false,
	ltrValue = true,
	iconClassName = "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
	delay = 0,
}: QuickCardProps) {
	return (
		<motion.a
			href={href}
			{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay, ease: "easeOut" }}
			viewport={{ once: true, amount: 0.3 }}
			className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
		>
			<span
				className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${iconClassName}`}
			>
				{icon}
			</span>
			<h3 className="mt-4 text-sm font-medium uppercase tracking-wide text-gray-500">
				{label}
			</h3>
			<p
				dir={ltrValue ? "ltr" : undefined}
				className="mt-1 break-words text-base font-semibold text-gray-900 ltr:text-left rtl:text-right"
			>
				{value}
			</p>
			<p className="mt-auto pt-3 text-sm text-gray-500">{hint}</p>
		</motion.a>
	);
}

export function ContactHeaderSection() {
	const t = useTranslations("contact.page.text");

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
						<Clock className="h-4 w-4" aria-hidden="true" />
						{t("response_time")}
					</span>

					<h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
						{t("title")}
					</h1>

					<p className="mt-5 text-lg leading-relaxed text-gray-600 md:text-xl">
						{t("subtitle")}
					</p>
				</motion.div>

				<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					<QuickCard
						icon={<Phone className="h-5 w-5" aria-hidden="true" />}
						label={t("call_us")}
						value={SITE_PHONE.display}
						hint={t("call_us_description")}
						href={SITE_PHONE_TEL_HREF}
						delay={0.05}
					/>
					<QuickCard
						icon={<WhatsAppIcon className="h-5 w-5" />}
						label={t("whatsapp")}
						value={SITE_WHATSAPP.display}
						hint={t("whatsapp_description")}
						href={SITE_WHATSAPP_CHAT_HREF}
						external
						iconClassName="bg-[#25D366]/10 text-[#1ebe5d] group-hover:bg-[#25D366] group-hover:text-white"
						delay={0.1}
					/>
					<QuickCard
						icon={<Mail className="h-5 w-5" aria-hidden="true" />}
						label={t("email_us")}
						value={SITE_EMAIL}
						hint={t("email_us_description")}
						href={SITE_EMAIL_HREF}
						delay={0.15}
					/>
					<QuickCard
						icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
						label={t("registered_address")}
						value={t("address_value")}
						hint={t("open_in_maps")}
						href={SITE_ADDRESS_MAPS_HREF}
						external
						ltrValue={false}
						iconClassName="bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white"
						delay={0.2}
					/>
				</div>
			</div>
		</section>
	);
}
