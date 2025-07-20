"use client";
import React, { ReactNode, useState, useEffect } from "react";
import {
	HoveredLink,
	Menu,
	MenuItem,
	ProductItem,
} from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, X, ChevronRight } from "lucide-react";
import { services } from "../services-data";

// Enhanced navigation data structure for expanded dropdowns
const navigationData = {
	services: {
		sections: [
			{
				title: "Our Services",
				items: [
					{
						name: "Home Physical Therapy",
						href: "/services/pt-home-visits",
						description:
							"Licensed physical therapists provide one-on-one treatment sessions at your home, including post-operative care and chronic condition management.",
					},
					{
						name: "Virtual Consultations",
						href: "/services/online-consultations",
						description:
							"Video calls with physical therapists, nutritionists, or psychologists — no travel needed.",
					},
					{
						name: "Home Lab Testing",
						href: "/services/lab-testing",
						description:
							"We send a nurse to collect your blood or samples from home. Lab results are delivered digitally.",
					},
					{
						name: "At-Home Radiology",
						href: "/services/at-home-radiology",
						description:
							"Portable X-rays and ultrasounds performed by our mobile technicians in your home.",
					},
					{
						name: "Exercise Program Library",
						href: "/services/exercise-programs",
						description:
							"Personalized video-based rehab programs sent after your consultation for follow-up care.",
					},
					{
						name: "Medical Equipment Store",
						href: "/services/store",
						description:
							"Browse and order mobility aids, braces, and more — all delivered to your doorstep.",
					},
					{
						name: "Home Nursing Care",
						href: "/services/home-nursing",
						description:
							"Professional nurses available for home visits to provide medication administration, wound care, post-operative support, IV therapy, and chronic condition management — all in the comfort of your home.",
					},
				],
			},
		],
	},
	app: {
		sections: [
			{
				title: "How it works",
				items: [
					{
						name: "Step 1 – Choose a Service",
						description: (
							<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
								<div>Select the healthcare service you need:</div>
								<ul className="list-disc ml-5 mt-1 text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
									<li>Home physical therapy</li>
									<li>At-home radiology</li>
									<li>Lab tests</li>
									<li>Virtual consultations with specialists</li>
								</ul>
							</div>
						),
					},
					{
						name: "Step 2 – Book Your Appointment",
						description: (
							<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
								Pick a convenient time and location. Our team confirms your
								request and prepares everything for your visit or call.
							</div>
						),
					},
					{
						name: "Step 3 – Receive Care at Home or Online",
						description: (
							<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
								Licensed professionals come to you with the tools they need — or
								meet you virtually for your consultation. No travel needed.
							</div>
						),
					},
					{
						name: "Step 4 – Follow Up & Stay Connected",
						description: (
							<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
								Access your reports, track recovery, and continue your care
								through the Aid x Bait app. We're with you every step of the
								way.
							</div>
						),
					},
					{
						name: "Step 5 – Need Medical Supplies?",
						description: (
							<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
								Visit our{" "}
								<a
									href="/services/store"
									className="text-blue-600 underline font-bold"
								>
									Online Store
								</a>{" "}
								to order braces, mobility aids, rehab equipment, and more — all
								delivered to your home, no appointment required.
							</div>
						),
					},
				],
			},
			{
				title: "Platform Access",
				items: [
					{
						name: "iOS App",
						href: "/app/ios",
						description: "Download for iPhone & iPad",
					},
					{
						name: "Android App",
						href: "/app/android",
						description: "Download for Android devices",
					},
					{
						name: "Web Platform",
						href: "/app/web",
						description: "Access from any browser",
					},
					{
						name: "Wearable Integration",
						href: "/app/wearables",
						description: "Sync with fitness trackers",
					},
				],
			},
			{
				title: "Support",
				items: [
					{
						name: "Getting Started",
						href: "/app/getting-started",
						description: "Quick setup guide",
					},
					{
						name: "Video Tutorials",
						href: "/app/tutorials",
						description: "Learn app features",
					},
					{
						name: "Technical Support",
						href: "/app/support",
						description: "Help with app issues",
					},
					{
						name: "Privacy & Security",
						href: "/app/privacy",
						description: "Your data protection",
					},
				],
			},
		],
	},
	providers: {
		sections: [
			{
				title: "For Healthcare Providers",
				items: [
					{
						name: "Provider Portal",
						href: "/providers/portal",
						description: "Manage patient referrals",
					},
					{
						name: "Integration Services",
						href: "/providers/integration",
						description: "EHR system connections",
					},
					{
						name: "Analytics Dashboard",
						href: "/providers/analytics",
						description: "Patient outcome tracking",
					},
					{
						name: "Billing Support",
						href: "/providers/billing",
						description: "Streamlined payment processing",
					},
				],
			},
			{
				title: "Partnership Programs",
				items: [
					{
						name: "Hospital Networks",
						href: "/providers/hospitals",
						description: "Comprehensive facility solutions",
					},
					{
						name: "Private Practices",
						href: "/providers/practices",
						description: "Independent provider tools",
					},
					{
						name: "Insurance Partners",
						href: "/providers/insurance",
						description: "Coverage network expansion",
					},
					{
						name: "Rehabilitation Centers",
						href: "/providers/rehab",
						description: "Specialized facility support",
					},
				],
			},
		],
	},
	testimonials: {
		sections: [
			{
				title: "Patient Stories",
				items: [
					{
						name: "Recovery Success Stories",
						href: "/testimonials/recovery",
						description: "Real patient experiences",
					},
					{
						name: "Video Testimonials",
						href: "/testimonials/videos",
						description: "Watch patient journeys",
					},
					{
						name: "Provider Reviews",
						href: "/testimonials/providers",
						description: "Healthcare professional feedback",
					},
					{
						name: "Family Experiences",
						href: "/testimonials/families",
						description: "Caregiver perspectives",
					},
				],
			},
			{
				title: "Case Studies",
				items: [
					{
						name: "Knee Replacement Recovery",
						href: "/testimonials/knee-replacement",
						description: "Complete recovery journeys",
					},
					{
						name: "Sports Injury Rehabilitation",
						href: "/testimonials/sports-injuries",
						description: "Athletic comeback stories",
					},
					{
						name: "Chronic Pain Management",
						href: "/testimonials/pain-management",
						description: "Long-term success stories",
					},
					{
						name: "Post-Surgery Outcomes",
						href: "/testimonials/post-surgery",
						description: "Surgical recovery experiences",
					},
				],
			},
		],
	},
	contact: {
		sections: [
			{
				title: "Get in Touch",
				items: [
					{
						name: "General Inquiries",
						href: "/contact/general",
						description: "Questions about our services",
					},
					{
						name: "New Patient Registration",
						href: "/contact/registration",
						description: "Start your care journey",
					},
					{
						name: "Provider Partnership",
						href: "/contact/providers",
						description: "Healthcare provider inquiries",
					},
					{
						name: "Technical Support",
						href: "/contact/support",
						description: "App and platform assistance",
					},
				],
			},
			{
				title: "Contact Methods",
				items: [
					{
						name: "Phone Support",
						href: "/contact/phone",
						description: "1-800-AIDXBAIT (24/7)",
					},
					{
						name: "Live Chat",
						href: "/contact/chat",
						description: "Instant messaging support",
					},
					{
						name: "Email Support",
						href: "/contact/email",
						description: "support@aidxbait.com",
					},
					{
						name: "Schedule Callback",
						href: "/contact/callback",
						description: "We'll call you back",
					},
				],
			},
			{
				title: "Locations",
				items: [
					{
						name: "Service Areas",
						href: "/contact/areas",
						description: "Find coverage in your area",
					},
					{
						name: "Office Locations",
						href: "/contact/offices",
						description: "Visit our physical locations",
					},
					{
						name: "Partner Facilities",
						href: "/contact/facilities",
						description: "Network of partner clinics",
					},
					{
						name: "Emergency Contacts",
						href: "/contact/emergency",
						description: "Urgent care information",
					},
				],
			},
		],
	},
};

navigationData.services.sections = [
	{
		title: "Our Services",
		items: [
			{
				name: "Home Physical Therapy",
				href: "/services/pt-home-visits",
				description:
					"Licensed physical therapists provide one-on-one treatment sessions at your home, including post-operative care and chronic condition management.",
			},
			{
				name: "Virtual Consultations",
				href: "/services/online-consultations",
				description:
					"Video calls with physical therapists, nutritionists, or psychologists — no travel needed.",
			},
			{
				name: "Home Lab Testing",
				href: "/services/lab-testing",
				description:
					"We send a nurse to collect your blood or samples from home. Lab results are delivered digitally.",
			},
			{
				name: "At-Home Radiology",
				href: "/services/at-home-radiology",
				description:
					"Portable X-rays and ultrasounds performed by our mobile technicians in your home.",
			},
			{
				name: "Exercise Program Library",
				href: "/services/exercise-programs",
				description:
					"Personalized video-based rehab programs sent after your consultation for follow-up care.",
			},
			{
				name: "Medical Equipment Store",
				href: "/services/store",
				description:
					"Browse and order mobility aids, braces, and more — all delivered to your doorstep.",
			},
			{
				name: "Home Nursing Care",
				href: "/services/home-nursing",
				description:
					"Professional nurses available for home visits to provide medication administration, wound care, post-operative support, IV therapy, and chronic condition management — all in the comfort of your home.",
			},
		],
	},
];

navigationData.app.sections = [
	{
		title: "How it works",
		items: [
			{
				name: "Step 1 – Choose a Service",
				description: (
					<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
						<div>Select the healthcare service you need:</div>
						<ul className="list-disc ml-5 mt-1 text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
							<li>Home physical therapy</li>
							<li>At-home radiology</li>
							<li>Lab tests</li>
							<li>Virtual consultations with specialists</li>
						</ul>
					</div>
				),
			},
			{
				name: "Step 2 – Book Your Appointment",
				description: (
					<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
						Pick a convenient time and location. Our team confirms your request
						and prepares everything for your visit or call.
					</div>
				),
			},
			{
				name: "Step 3 – Receive Care at Home or Online",
				description: (
					<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
						Licensed professionals come to you with the tools they need — or
						meet you virtually for your consultation. No travel needed.
					</div>
				),
			},
			{
				name: "Step 4 – Follow Up & Stay Connected",
				description: (
					<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
						Access your reports, track recovery, and continue your care through
						the Aid x Bait app. We're with you every step of the way.
					</div>
				),
			},
			{
				name: "Step 5 – Need Medical Supplies?",
				description: (
					<div className="text-xs text-neutral-700 dark:text-neutral-300 break-words max-w-xs">
						Visit our{" "}
						<a
							href="/services/store"
							className="text-blue-600 underline font-bold"
						>
							Online Store
						</a>{" "}
						to order braces, mobility aids, rehab equipment, and more — all
						delivered to your home, no appointment required.
					</div>
				),
			},
		],
	},
];

export default function NavbarDemo() {
	return (
		<div className="relative w-full flex items-center justify-center">
			<Navbar className="top-2" />
		</div>
	);
}

function Navbar({ className }: { className?: string }) {
	const [active, setActive] = useState<string | null>(null);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeServiceIdx, setActiveServiceIdx] = useState(0);
	const [activeAppIdx, setActiveAppIdx] = useState(0);
	const [activeProviderIdx, setActiveProviderIdx] = useState(0);
	const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
	const [activeContactIdx, setActiveContactIdx] = useState(0);
	const [isMounted, setIsMounted] = useState(false);
	const [activeWhyIdx, setActiveWhyIdx] = useState(0);
	const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
	const [currentLanguage, setCurrentLanguage] = useState("En");

	useEffect(() => {
		setIsMounted(true);

		const handleScroll = () => {
			const scrollTop = window.scrollY;
			setIsScrolled(scrollTop > 50);
		};

		// Set initial scroll state
		handleScroll();

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Prevent hydration mismatch by not rendering scroll-dependent styles until mounted
	if (!isMounted) {
		return (
			<div
				className={cn(
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-3xl px-4 sm:px-0 top-4",
					className
				)}
			>
				<div className="relative rounded-full bg-white dark:bg-black dark:border-white/[0.2] border border-transparent shadow-input flex items-center px-8 py-4 sm:py-2 mx-auto mt-4 max-w-3xl justify-between">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/images/logo.png"
							alt="AidXBait Logo"
							width={100}
							height={50}
							className="object-contain sm:w-[120px] sm:h-[60px]"
							priority
						/>
					</Link>
					<div className="flex justify-end space-x-4 w-full">
						<div className="hidden md:flex space-x-6">
							{/* Skeleton menu items */}
							<div className="px-3 py-2 ">Services</div>
							<div className="px-3 py-2">How it works</div>
							<div className="px-3 py-2">Why Aid x Bait?</div>
							<div className="px-3 py-2">App features</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const logo = (
		<Link href="/" className="flex items-center gap-2">
			<Image
				src="/images/logo.png"
				alt="AidXBait Logo"
				width={140}
				height={70}
				className="object-contain sm:w-[160px] sm:h-[80px]"
				priority
			/>
		</Link>
	);

	return (
		<>
			<div
				className={cn(
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-6xl px-4 sm:px-0",
					isScrolled ? "top-0" : "top-4",
					className
				)}
			>
				<nav
					onMouseLeave={() => setActive(null)}
					className={cn(
						"border border-transparent shadow-input flex items-center transition-all duration-200 z-50",
						isScrolled
							? "fixed top-0 left-0 w-full rounded-none backdrop-blur-md bg-white/90 dark:bg-slate-900/90 px-96 py-1 justify-between shadow-2xl drop-shadow-lg"
							: "relative rounded-full bg-white/95 dark:bg-black/95 dark:border-white/[0.2] backdrop-blur-sm px-10 py-4 sm:py-1 mx-auto mt-4 max-w-6xl justify-between shadow-2xl drop-shadow-lg"
					)}
				>
					{/* Logo */}
					<div className="flex-shrink-0 mr-8">{logo}</div>

					{/* Left Menu Items */}
					<div className="hidden md:flex space-x-4">
						{/* Services Menu */}
						<div
							onMouseEnter={() => setActive("Services")}
							className="relative"
						>
							<Link
								href="/services"
								className="text-md px-2 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-blue-50"
							>
								Services
							</Link>
							{active === "Services" && (
								<div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
									<div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-[680px]">
										<div className="flex">
											<ul className="space-y-1 pr-4 border-r border-gray-200 w-[220px] flex-shrink-0">
												{[
													{
														name: "Home Physical Therapy",
														href: "/services/pt-home-visits",
														description:
															"Licensed physical therapists provide one-on-one treatment sessions at your home, including post-operative care and chronic condition management.",
													},
													{
														name: "Home Lab Tests",
														href: "/services/lab-testing",
														description:
															"We send a nurse to collect your blood or samples from home. Lab results are delivered digitally.",
													},
													{
														name: "Home Imaging",
														href: "/services/at-home-radiology",
														description:
															"Portable X-rays and ultrasounds performed by our mobile technicians in your home.",
													},
													{
														name: "Home Nursing",
														href: "/services/home-nursing",
														description:
															"Professional nurses available for home visits to provide medication administration, wound care, and more.",
													},
													{
														name: "Online Video Consultations",
														href: "/services/online-consultations",
														description:
															"Video calls with physical therapists, nutritionists, or psychologists — no travel needed.",
													},
												].map((item, idx) => (
													<li key={item.name}>
														<Link href={item.href}>
															<button
																className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
																	idx === activeServiceIdx
																		? "bg-blue-50 text-blue-700 border border-blue-200"
																		: "hover:bg-gray-50 text-gray-700"
																}`}
																onMouseEnter={() => setActiveServiceIdx(idx)}
																onFocus={() => setActiveServiceIdx(idx)}
																tabIndex={0}
															>
																{item.name}
															</button>
														</Link>
													</li>
												))}
											</ul>
											<div className="flex flex-col justify-center px-3 w-[200px] border-r border-gray-200 flex-shrink-0">
												<h4 className="font-semibold text-base mb-3 text-gray-900">
													{
														[
															"Home Physical Therapy",
															"Home Lab Tests",
															"Home Imaging",
															"Home Nursing",
															"Online Video Consultations",
														][activeServiceIdx]
													}
												</h4>
												<p className="text-sm text-gray-600 mb-4 leading-relaxed">
													{
														[
															"Licensed physical therapists provide one-on-one treatment sessions at your home, including post-operative care and chronic condition management.",
															"We send a nurse to collect your blood or samples from home. Lab results are delivered digitally.",
															"Portable X-rays and ultrasounds performed by our mobile technicians in your home.",
															"Professional nurses available for home visits to provide medication administration, wound care, and more.",
															"Video calls with physical therapists, nutritionists, or psychologists — no travel needed.",
														][activeServiceIdx]
													}
												</p>
												<Link
													href={
														[
															"/services/pt-home-visits",
															"/services/lab-testing",
															"/services/at-home-radiology",
															"/services/home-nursing",
															"/services/online-consultations",
														][activeServiceIdx]
													}
													className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
												>
													Learn More <ChevronRight className="ml-1 h-4 w-4" />
												</Link>
											</div>
											<div className="relative w-[240px] bg-blue-50 ml-4 rounded-lg p-4">
												<img
													src={
														[
															"/images/services2.png",
															"/images/services1.png",
															"/images/services3.png",
															"/images/services4.png",
															"/images/services2.png",
														][activeServiceIdx]
													}
													alt={
														[
															"Home Physical Therapy",
															"Home Lab Tests",
															"Home Imaging",
															"Home Nursing",
															"Online Video Consultations",
														][activeServiceIdx]
													}
													className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100"
													style={{ minHeight: "140px" }}
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Products Menu */}
						<div
							onMouseEnter={() => setActive("Products")}
							className="relative"
						>
							<Link
								href="/products"
								className="text-md px-2 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-blue-50"
							>
								Products
							</Link>
							{active === "Products" && (
								<div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
									<div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-[680px]">
										<div className="flex">
											<ul className="space-y-1 pr-4 border-r border-gray-200 w-[220px] flex-shrink-0">
												{[
													{
														name: "Medical Store",
														href: "/services/store",
														description:
															"Order medical supplies, medications, and equipment directly to your home.",
													},
													{
														name: "Equipment Rental",
														href: "/products/equipment-rental",
														description:
															"Rent medical equipment like wheelchairs, walkers, and mobility aids.",
													},
													{
														name: "Home-Exercise Programs",
														href: "/services/exercise-programs",
														description:
															"Personalized video-based rehab programs for your recovery.",
													},
												].map((item, idx) => (
													<li key={item.name}>
														<Link href={item.href}>
															<button
																className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
																	idx === activeAppIdx
																		? "bg-blue-50 text-blue-700 border border-blue-200"
																		: "hover:bg-gray-50 text-gray-700"
																}`}
																onMouseEnter={() => setActiveAppIdx(idx)}
																onFocus={() => setActiveAppIdx(idx)}
																tabIndex={0}
															>
																{item.name}
															</button>
														</Link>
													</li>
												))}
											</ul>
											<div className="flex flex-col justify-center px-3 w-[200px] border-r border-gray-200 flex-shrink-0">
												<h4 className="font-semibold text-base mb-3 text-gray-900">
													{
														[
															"Medical Store",
															"Equipment Rental",
															"Home-Exercise Programs",
														][activeAppIdx]
													}
												</h4>
												<p className="text-sm text-gray-600 mb-4 leading-relaxed">
													{
														[
															"Order medical supplies, medications, and equipment directly to your home.",
															"Rent medical equipment like wheelchairs, walkers, and mobility aids.",
															"Personalized video-based rehab programs for your recovery.",
														][activeAppIdx]
													}
												</p>
												<Link
													href={
														[
															"/services/store",
															"/products/equipment-rental",
															"/services/exercise-programs",
														][activeAppIdx]
													}
													className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
												>
													Learn More <ChevronRight className="ml-1 h-4 w-4" />
												</Link>
											</div>
											<div className="relative w-[240px] bg-blue-50 ml-4 rounded-lg p-4">
												<img
													src={
														[
															"/images/services1.png",
															"/images/services3.png",
															"/images/services2.png",
														][activeAppIdx]
													}
													alt={
														[
															"Medical Store",
															"Equipment Rental",
															"Home-Exercise Programs",
														][activeAppIdx]
													}
													className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100"
													style={{ minHeight: "140px" }}
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Contact Us Menu */}
						<div
							onMouseEnter={() => setActive("Contact Us")}
							className="relative"
						>
							<Link
								href="/contact"
								className="text-md px-2 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-blue-50"
							>
								Contact Us
							</Link>
							{active === "Contact Us" && (
								<div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
									<div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-[680px]">
										<div className="flex">
											<ul className="space-y-1 pr-4 border-r border-gray-200 w-[220px] flex-shrink-0">
												{[
													{
														name: "Call-me Request",
														href: "/contact/callback",
														description:
															"Request a callback from our team and we'll get in touch with you shortly.",
													},
													{
														name: "WhatsApp Chatbot",
														href: "/contact/chat",
														description:
															"Chat with our AI assistant for instant support and answers.",
													},
													{
														name: "Send a Message",
														href: "/contact/email",
														description:
															"Send us a detailed message and we'll respond within 24 hours.",
													},
												].map((item, idx) => (
													<li key={item.name}>
														<Link href={item.href}>
															<button
																className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm font-medium ${
																	idx === activeContactIdx
																		? "bg-blue-50 text-blue-700 border border-blue-200"
																		: "hover:bg-gray-50 text-gray-700"
																}`}
																onMouseEnter={() => setActiveContactIdx(idx)}
																onFocus={() => setActiveContactIdx(idx)}
																tabIndex={0}
															>
																{item.name}
															</button>
														</Link>
													</li>
												))}
											</ul>
											<div className="flex flex-col justify-center px-3 w-[200px] border-r border-gray-200 flex-shrink-0">
												<h4 className="font-semibold text-base mb-3 text-gray-900">
													{
														[
															"Call-me Request",
															"WhatsApp Chatbot",
															"Send a Message",
														][activeContactIdx]
													}
												</h4>
												<p className="text-sm text-gray-600 mb-4 leading-relaxed">
													{
														[
															"Request a callback from our team and we'll get in touch with you shortly.",
															"Chat with our AI assistant for instant support and answers.",
															"Send us a detailed message and we'll respond within 24 hours.",
														][activeContactIdx]
													}
												</p>
												<Link
													href={
														[
															"/contact/callback",
															"/contact/chat",
															"/contact/email",
														][activeContactIdx]
													}
													className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
												>
													Learn More <ChevronRight className="ml-1 h-4 w-4" />
												</Link>
											</div>
											<div className="relative w-[240px] bg-blue-50 ml-4 rounded-lg p-4">
												<img
													src={
														[
															"/images/services3.png",
															"/images/services4.png",
															"/images/services1.png",
														][activeContactIdx]
													}
													alt={
														[
															"Call-me Request",
															"WhatsApp Chatbot",
															"Send a Message",
														][activeContactIdx]
													}
													className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100"
													style={{ minHeight: "140px" }}
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* About Menu */}
						<div onMouseEnter={() => setActive("About")} className="relative">
							<span className="text-md px-2 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-blue-50">
								About
							</span>
							{active === "About" && (
								<div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
									<div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 w-[680px]">
										<div className="flex">
											<div className="w-full px-4">
												<div className="mb-6">
													<h4 className="font-semibold text-lg mb-3 text-gray-900">
														Our Vision
													</h4>
													<p className="text-sm text-gray-600 mb-4 leading-relaxed">
														To revolutionize healthcare delivery by making
														quality medical services accessible at home,
														empowering patients to receive professional care in
														the comfort of their own environment.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-lg mb-3 text-gray-900">
														Our Mission
													</h4>
													<p className="text-sm text-gray-600 leading-relaxed">
														We are committed to providing comprehensive,
														technology-driven healthcare solutions that bridge
														the gap between patients and medical professionals,
														ensuring convenient, efficient, and personalized
														care for everyone.
													</p>
												</div>
											</div>
											<div className="relative w-[240px] bg-blue-50 ml-4 rounded-lg p-4">
												<img
													src="/images/services4.png"
													alt="About AidXBait"
													className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100"
													style={{ minHeight: "140px" }}
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Spacer */}
					<div className="flex-grow"></div>

					{/* Right Side Menu Items */}
					<div className="hidden md:flex items-center space-x-6 ml-8">
						{/* Language Toggle Switch */}
						<div className="flex items-center">
							<div className="relative ">
								<button
									onClick={() =>
										setCurrentLanguage(currentLanguage === "En" ? "Ar" : "En")
									}
									className="relative inline-flex items-center h-8 rounded-full w-16 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition-all duration-300 focus:outline-none shadow-sm border border-blue-200"
								>
									<span
										className={`inline-block w-6 h-6 transform bg-white rounded-full transition-all duration-300 shadow-md border border-blue-300 ${
											currentLanguage === "En"
												? "translate-x-1"
												: "translate-x-9"
										}`}
									/>
									<span
										className={`absolute text-xs font-semibold transition-all duration-300 ${
											currentLanguage === "En"
												? "left-2 text-blue-700"
												: "right-2 text-blue-700"
										}`}
									>
										{currentLanguage}
									</span>
									<span
										className={`absolute text-xs font-medium transition-all duration-300 opacity-60 ${
											currentLanguage === "En"
												? "right-2 text-blue-600"
												: "left-2 text-blue-600"
										}`}
									>
										{currentLanguage === "En" ? "Ar" : "En"}
									</span>
								</button>
							</div>
						</div>

						{/* FAQs */}
						<Link
							href="/faqs"
							className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-blue-50"
						>
							FAQs
						</Link>

						{/* Login */}
						<Link
							href="/login"
							className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
						>
							Login
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden cursor-pointer text-black dark:text-white"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					>
						{isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
					</button>
				</nav>
			</div>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
					<div className="absolute top-20 left-4 right-4 bg-white dark:bg-black rounded-2xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
						<nav className="space-y-6">
							{/* Mobile Navigation */}
							<div>
								<h3 className="font-bold text-lg mb-3">Services</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="/services/pt-home-visits">
										Home Physical Therapy
									</HoveredLink>
									<HoveredLink href="/services/lab-testing">
										Home Lab Tests
									</HoveredLink>
									<HoveredLink href="/services/at-home-radiology">
										Home Imaging
									</HoveredLink>
									<HoveredLink href="/services/home-nursing">
										Home Nursing
									</HoveredLink>
									<HoveredLink href="/services/online-consultations">
										Online Video Consultations
									</HoveredLink>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-lg mb-3">Products</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="/services/store">
										Medical Store
									</HoveredLink>
									<HoveredLink href="/products/equipment-rental">
										Equipment Rental
									</HoveredLink>
									<HoveredLink href="/services/exercise-programs">
										Home-Exercise Programs
									</HoveredLink>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-lg mb-3">Contact Us</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="/contact/callback">
										Call-me Request
									</HoveredLink>
									<HoveredLink href="/contact/chat">
										WhatsApp Chatbot
									</HoveredLink>
									<HoveredLink href="/contact/email">
										Send a Message
									</HoveredLink>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-lg mb-3">About</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="/about">Our Vision & Mission</HoveredLink>
								</div>
							</div>
							<div className="border-t pt-4">
								<div className="flex items-center justify-between">
									<div className="flex space-x-4">
										<HoveredLink href="/faqs">FAQs</HoveredLink>
										<HoveredLink href="/login">Login</HoveredLink>
									</div>
									<div className="flex items-center space-x-2">
										<span className="text-sm text-gray-600">Language:</span>
										<button
											onClick={() =>
												setCurrentLanguage(
													currentLanguage === "En" ? "Ar" : "En"
												)
											}
											className="text-sm font-medium text-blue-600 hover:text-blue-700"
										>
											{currentLanguage}
										</button>
									</div>
								</div>
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
