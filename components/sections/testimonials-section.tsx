"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import TestimonialsCarousel from "@/components/ui/testimonials-carousel";
import type { Testimonial } from "@/components/ui/testimonials-carousel";

const testimonialSources: { key: string; src: string }[] = [
	{
		key: "sarah_johnson",
		src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	},
	{
		key: "michael_chen",
		src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	},
	{
		key: "emily_rodriguez",
		src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	},
	{
		key: "james_lee",
		src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	},
	{
		key: "priya_patel",
		src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
	},
];

export function TestimonialsSection() {
	const t = useTranslations("sections.testimonials.data");
	const testimonials: Testimonial[] = testimonialSources.map(({ key, src }) => ({
		quote: t(`quote.${key}`),
		name: t(`name.${key}`),
		designation: t(`designation.${key}`),
		src,
	}));
	return (
		<section id="testimonials" className="bg-white py-20">
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.8 }}
			>
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<TestimonialsCarousel testimonials={testimonials} autoplay />
				</motion.div>
			</motion.div>
		</section>
	);
}
