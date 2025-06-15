"use client";
import { useRef } from "react";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { AppDownloadSection } from "@/components/app-download-section";
import TestimonialsSection from "@/components/testimonials-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection
        navbar={<Navbar sentinelRef={sentinelRef} />}
        sentinelRef={sentinelRef}
      />
      <main>
        <ServicesSection />
        <HowItWorksSection />
        <AppDownloadSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
