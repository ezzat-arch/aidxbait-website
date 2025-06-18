"use client";
import { useRef, useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { AppDownloadSection } from "@/components/app-download-section";
import TestimonialsSection from "@/components/testimonials-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import BentoGridThirdDemo from "@/components/ui/bento-grid-demo-3";

export default function Home() {
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return <div className="min-h-screen bg-white" />;
	}

	return (
		<div className="flex flex-col min-h-screen">
			<HeroSection sentinelRef={sentinelRef} />
			<main>
				<ServicesSection />
				<div className="my-16 py-8 px-4 sm:px-6 lg:px-8">
					<BentoGridThirdDemo />
				</div>
				<AppDownloadSection />
				<TestimonialsSection />
				<ContactSection />
			</main>
			<Footer />
		</div>
	);
}
