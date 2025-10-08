"use client";
import { useRef, useState, useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { AppFeaturesSection } from "@/components/app-features-section";
import { WhyAidXBaitSection } from "@/components/why-aidxbait-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { AppDownloadSection } from "@/components/app-download-section";
import TestimonialsSection from "@/components/testimonials-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import AidxbaitInNumbers from "@/components/ui/aidxbait-in-numbers";

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
			{/* <AppDownloadSection /> */}
			<main>
				<ServicesSection />
				<AppFeaturesSection />
				<WhyAidXBaitSection />
				{/* <HowItWorksSection /> */}
				{/* <AidxbaitInNumbers /> */}
				{/* <TestimonialsSection /> */}
				<ContactSection />
			</main>
			<Footer />
		</div>
	);
}
