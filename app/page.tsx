"use client";
import { useRef, useState, useEffect } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { BodyMapSection } from "@/components/sections/body-map-section";
import { WhyAidXBaitSection } from "@/components/sections/why-aidxbait-section";
import { ContactSection } from "@/components/sections/contact-section";
import { Footer } from "@/components/layout/footer";
// import { AidXbaitMetricsSection } from "@/components/sections/aidxbait-metrics-section";
// import { TestimonialsSection } from "@/components/sections/testimonials-section";

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
				<BodyMapSection />
				<ServicesSection />
				<WhyAidXBaitSection />
				{/* <AidXbaitMetricsSection /> */}
				{/* <TestimonialsSection /> */}
				<ContactSection />
			</main>
			<Footer />
		</div>
	);
}
