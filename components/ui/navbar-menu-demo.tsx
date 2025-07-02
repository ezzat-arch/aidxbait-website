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
							<div className="px-3 py-2">Services</div>
							<div className="px-3 py-2">Our App</div>
							<div className="px-3 py-2">For Providers</div>
							<div className="px-3 py-2">Testimonials</div>
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
				width={100}
				height={50}
				className="object-contain sm:w-[120px] sm:h-[60px]"
				priority
			/>
		</Link>
	);

	return (
		<>
			<div
				className={cn(
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-3xl px-4 sm:px-0",
					isScrolled ? "top-0" : "top-4",
					className
				)}
			>
				<Menu setActive={setActive} logo={logo} isScrolled={isScrolled}>
					{/* Desktop Navigation with Dropdowns */}
					<div className="hidden md:flex space-x-6">
						{/* Services Menu */}
						<MenuItem
							setActive={setActive}
							active={active}
							item={<Link href="/services">Services</Link>}
							itemKey="Services"
						>
							{(() => {
								const allServiceItems =
									navigationData.services.sections.flatMap((section) =>
										section.items.map((item: any) => ({
											...item,
											section: section.title,
										}))
									);
								const activeItem = allServiceItems[activeServiceIdx];
								const appImages = [
									"/images/services2.png",
									"/images/services1.png",
									"/images/services3.png",
									"/images/services4.png",
								];
								const getImage = (idx: number) =>
									appImages[idx % appImages.length];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[480px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 w-[180px]">
											{allServiceItems
												.slice(0, 6)
												.map((item: any, idx: number) => (
													<li key={item.name}>
														{"href" in item ? (
															<Link href={item.href}>
																<button
																	className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																		idx === activeServiceIdx
																			? "bg-primary/10 text-primary"
																			: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
																	}`}
																	onMouseEnter={() => setActiveServiceIdx(idx)}
																	onFocus={() => setActiveServiceIdx(idx)}
																	tabIndex={0}
																>
																	{item.name}
																</button>
															</Link>
														) : (
															<button
																className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																	idx === activeServiceIdx
																		? "bg-primary/10 text-primary"
																		: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
																}`}
																onMouseEnter={() => setActiveServiceIdx(idx)}
																onFocus={() => setActiveServiceIdx(idx)}
																tabIndex={0}
															>
																{item.name}
															</button>
														)}
													</li>
												))}
										</ul>
										<div className="flex flex-col justify-center px-4 w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											{typeof activeItem.description === "string" ? (
												<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4 break-words max-w-xs">
													{activeItem.description}
												</p>
											) : (
												activeItem.description
											)}
											{"href" in activeItem ? (
												<Link
													href={activeItem.href}
													className="inline-flex items-center text-xs font-medium text-primary hover:underline"
												>
													Learn More <ChevronRight className="ml-1 h-3 w-3" />
												</Link>
											) : null}
										</div>
										<div className="relative flex items-center justify-center w-[160px]">
											<img
												src={getImage(activeServiceIdx)}
												alt={activeItem.name}
												className="w-full h-32 object-cover rounded-lg shadow-md"
											/>
										</div>
									</div>
								);
							})()}
						</MenuItem>

						{/* Our App Menu */}
						<MenuItem
							setActive={setActive}
							active={active}
							item={<Link href="/app">How it works</Link>}
							itemKey="How it works"
						>
							{(() => {
								const allAppItems = navigationData.app.sections.flatMap(
									(section) =>
										section.items.map((item: any) => ({
											...item,
											section: section.title,
										}))
								);
								const activeItem = allAppItems[activeAppIdx];
								// Always use the same image and styling as the first image in the Services dropdown
								const fixedImage = "/images/services2.png";
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[180px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 w-[280px]">
											{allAppItems.slice(0, 6).map((item: any, idx: number) => (
												<li key={item.name}>
													{"href" in item ? (
														<Link href={item.href}>
															<button
																className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																	idx === activeAppIdx
																		? "bg-primary/10 text-primary"
																		: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
																}`}
																onMouseEnter={() => setActiveAppIdx(idx)}
																onFocus={() => setActiveAppIdx(idx)}
																tabIndex={0}
															>
																{item.name}
															</button>
														</Link>
													) : (
														<button
															className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																idx === activeAppIdx
																	? "bg-primary/10 text-primary"
																	: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
															}`}
															onMouseEnter={() => setActiveAppIdx(idx)}
															onFocus={() => setActiveAppIdx(idx)}
															tabIndex={0}
														>
															{item.name}
														</button>
													)}
												</li>
											))}
										</ul>
										<div className="flex flex-col justify-center px-4 w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											{typeof activeItem.description === "string" ? (
												<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4 break-words max-w-xs">
													{activeItem.description}
												</p>
											) : (
												activeItem.description
											)}
											{"href" in activeItem ? (
												<Link
													href={activeItem.href}
													className="inline-flex items-center text-xs font-medium text-primary hover:underline"
												>
													Learn More <ChevronRight className="ml-1 h-3 w-3" />
												</Link>
											) : null}
										</div>
										<div className="relative flex items-center justify-center w-[160px]">
											<img
												src={fixedImage}
												alt="Step 1 – Choose a Service"
												className="w-full h-32 object-cover rounded-lg shadow-md"
											/>
										</div>
									</div>
								);
							})()}
						</MenuItem>

						{/* For Providers Menu */}
						<MenuItem
							setActive={setActive}
							active={active}
							item={<span>Why Aid x Bait?</span>}
							itemKey="Why Aid x Bait?"
						>
							{(() => {
								const whyItems = [
									{
										title: "24-Hour Average Response Time",
										description:
											"Fast appointment scheduling for urgent needs.",
									},
									{
										title: "Licensed Professionals",
										description:
											"All therapists and technicians are fully certified.",
									},
									{
										title: "Serving Cairo, Giza & More",
										description: "Expanding across key areas in Egypt.",
									},
									{
										title: "Everything in One App",
										description: "Book, track, and follow-up with ease.",
									},
								];
								const activeItem = whyItems[activeWhyIdx];
								const whyImages = [
									"/images/services2.png",
									"/images/services1.png",
									"/images/services3.png",
									"/images/services4.png",
								];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[480px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 w-[180px]">
											{whyItems.map((item, idx) => (
												<li key={item.title}>
													<button
														className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
															idx === activeWhyIdx
																? "bg-primary/10 text-primary"
																: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
														}`}
														onMouseEnter={() => setActiveWhyIdx(idx)}
														onFocus={() => setActiveWhyIdx(idx)}
														tabIndex={0}
													>
														{item.title}
													</button>
												</li>
											))}
										</ul>
										<div className="flex flex-col justify-center px-4 w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.title}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4 break-words max-w-xs">
												{activeItem.description}
											</p>
										</div>
										<div className="relative flex items-center justify-center w-[160px]">
											<img
												src={whyImages[activeWhyIdx]}
												alt={activeItem.title}
												className="w-full h-32 object-cover rounded-lg shadow-md"
											/>
										</div>
									</div>
								);
							})()}
						</MenuItem>

						{/* Testimonials Menu */}
						<MenuItem
							setActive={setActive}
							active={active}
							item={<span>App features</span>}
							itemKey="App features"
						>
							{(() => {
								const features = [
									{
										title: "Book appointments",
										description:
											"Schedule visits with healthcare professionals at your convenience.",
									},
									{
										title: "View lab results",
										description:
											"Access your medical test results securely and quickly.",
									},
									{
										title: "Chat with providers",
										description:
											"Communicate directly with your care team for support and questions.",
									},
									{
										title: "Access exercise plans",
										description:
											"Follow personalized exercise routines designed for your recovery.",
									},
									{
										title: "Track progress",
										description:
											"Monitor your health improvements and milestones over time.",
									},
								];
								const activeItem = features[activeFeatureIdx];
								const appFeatureImages = [
									"/images/services1.png",
									"/images/services3.png",
									"/images/services2.png",
									"/images/services4.png",
									"/images/services4.png",
								];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[480px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 w-[180px]">
											{features.map((item, idx) => (
												<li key={item.title}>
													<button
														className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
															idx === activeFeatureIdx
																? "bg-primary/10 text-primary"
																: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
														}`}
														onMouseEnter={() => setActiveFeatureIdx(idx)}
														onFocus={() => setActiveFeatureIdx(idx)}
														tabIndex={0}
													>
														{item.title}
													</button>
												</li>
											))}
										</ul>
										<div className="flex flex-col justify-center px-4 w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.title}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4 break-words max-w-xs">
												{activeItem.description}
											</p>
										</div>
										<div className="relative flex items-center justify-center w-[160px]">
											<img
												src={appFeatureImages[activeFeatureIdx]}
												alt={activeItem.title}
												className="w-full h-32 object-cover rounded-lg shadow-md"
											/>
										</div>
									</div>
								);
							})()}
						</MenuItem>
					</div>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden cursor-pointer text-black dark:text-white"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					>
						{isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
					</button>
				</Menu>
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
									<HoveredLink href="#services">All Services</HoveredLink>
									<HoveredLink href="/services/pt-home-visits">
										PT Home Visits
									</HoveredLink>
									<HoveredLink href="/services/exercise-programs">
										Exercise Programs
									</HoveredLink>
									<HoveredLink href="/services/online-consultations">
										Online Consultations
									</HoveredLink>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-lg mb-3">Our App</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="#app">App Overview</HoveredLink>
									<HoveredLink href="/app/ios">iOS App</HoveredLink>
									<HoveredLink href="/app/android">Android App</HoveredLink>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-lg mb-3">For Providers</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="/providers/portal">
										Provider Portal
									</HoveredLink>
									<HoveredLink href="/providers/partnership">
										Partnership
									</HoveredLink>
								</div>
							</div>
							<div>
								<h3 className="font-bold text-lg mb-3">Testimonials</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="#testimonials">
										Patient Stories
									</HoveredLink>
									<HoveredLink href="/testimonials/videos">
										Video Testimonials
									</HoveredLink>
								</div>
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
