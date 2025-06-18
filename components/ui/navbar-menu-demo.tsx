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
				title: "Core Services",
				items: [
					{
						name: "PT Home Visits",
						href: "/services/pt-home-visits",
						description: "Professional therapists at your location",
					},
					{
						name: "Exercise Programs",
						href: "/services/exercise-programs",
						description: "Personalized rehabilitation routines",
					},
					{
						name: "Online Consultations",
						href: "/services/online-consultations",
						description: "Virtual expert consultations",
					},
					{
						name: "Medical Equipment Store",
						href: "/services/store",
						description: "Rehab tools and devices",
					},
				],
			},
			{
				title: "Specialized Care",
				items: [
					{
						name: "Post-Surgery Recovery",
						href: "/services/post-surgery",
						description: "Comprehensive post-operative care",
					},
					{
						name: "Pain Management",
						href: "/services/pain-management",
						description: "Advanced pain relief strategies",
					},
					{
						name: "Sports Rehabilitation",
						href: "/services/sports-rehab",
						description: "Athletic injury recovery",
					},
					{
						name: "Chronic Condition Support",
						href: "/services/chronic-care",
						description: "Long-term management solutions",
					},
				],
			},
			{
				title: "Quick Access",
				items: [
					{
						name: "24/7 Emergency Support",
						href: "/services/emergency",
						description: "Immediate orthopedic assistance",
					},
					{
						name: "Insurance Verification",
						href: "/services/insurance",
						description: "Check coverage options",
					},
					{
						name: "Appointment Booking",
						href: "/services/booking",
						description: "Schedule your visit",
					},
					{
						name: "Patient Portal",
						href: "/services/portal",
						description: "Access your care plan",
					},
				],
			},
		],
	},
	app: {
		sections: [
			{
				title: "App Features",
				items: [
					{
						name: "Exercise Tracking",
						href: "/app/exercise-tracking",
						description: "Monitor your daily progress",
					},
					{
						name: "Virtual PT Sessions",
						href: "/app/virtual-sessions",
						description: "Live therapy sessions",
					},
					{
						name: "Progress Analytics",
						href: "/app/analytics",
						description: "Detailed recovery insights",
					},
					{
						name: "Medication Reminders",
						href: "/app/medications",
						description: "Never miss your prescriptions",
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
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-6xl px-4 sm:px-0 top-4",
					className
				)}
			>
				<div className="relative rounded-full bg-white dark:bg-black dark:border-white/[0.2] border border-transparent shadow-input flex items-center px-8 py-4 sm:py-2 mx-auto mt-4 max-w-6xl justify-between">
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
							<div className="px-3 py-2">Contact</div>
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
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-6xl px-4 sm:px-0",
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
										section.items.map((item) => ({
											...item,
											section: section.title,
										}))
									);
								const activeItem = allServiceItems[activeServiceIdx];
								const serviceImages = [
									"/images/services1.png",
									"/images/services2.png",
									"/images/services3.png",
									"/images/services4.png",
								];
								const getImage = (idx: number) =>
									serviceImages[idx % serviceImages.length];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[600px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 min-w-[180px]">
											{allServiceItems.slice(0, 6).map((item, idx: number) => (
												<li key={item.name}>
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
												</li>
											))}
										</ul>
										<div className="flex flex-col justify-center px-4 min-w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4">
												{activeItem.description}
											</p>
											<Link
												href={activeItem.href}
												className="inline-flex items-center text-xs font-medium text-primary hover:underline"
											>
												Learn More <ChevronRight className="ml-1 h-3 w-3" />
											</Link>
										</div>
										<div className="relative flex items-center justify-center min-w-[160px]">
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
							item={<Link href="/app">Our App</Link>}
							itemKey="Our App"
						>
							{(() => {
								const allAppItems = navigationData.app.sections.flatMap(
									(section) =>
										section.items.map((item) => ({
											...item,
											section: section.title,
										}))
								);
								const activeItem = allAppItems[activeAppIdx];
								const appImages = [
									"/images/services2.png",
									"/images/services1.png",
									"/images/services3.png",
									"/images/services4.png",
								];
								const getImage = (idx: number) =>
									appImages[idx % appImages.length];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[600px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 min-w-[180px]">
											{allAppItems.slice(0, 6).map((item, idx: number) => (
												<li key={item.name}>
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
												</li>
											))}
										</ul>
										<div className="flex flex-col justify-center px-4 min-w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4">
												{activeItem.description}
											</p>
											<Link
												href={activeItem.href}
												className="inline-flex items-center text-xs font-medium text-primary hover:underline"
											>
												Learn More <ChevronRight className="ml-1 h-3 w-3" />
											</Link>
										</div>
										<div className="relative flex items-center justify-center min-w-[160px]">
											<img
												src={getImage(activeAppIdx)}
												alt={activeItem.name}
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
							item={<Link href="/providers">For Providers</Link>}
							itemKey="For Providers"
						>
							{(() => {
								const allProviderItems =
									navigationData.providers.sections.flatMap((section) =>
										section.items.map((item) => ({
											...item,
											section: section.title,
										}))
									);
								const activeItem = allProviderItems[activeProviderIdx];
								const providerImages = [
									"/images/services3.png",
									"/images/services1.png",
									"/images/services2.png",
									"/images/services4.png",
								];
								const getImage = (idx: number) =>
									providerImages[idx % providerImages.length];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[600px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 min-w-[180px]">
											{allProviderItems.slice(0, 6).map((item, idx: number) => (
												<li key={item.name}>
													<Link href={item.href}>
														<button
															className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																idx === activeProviderIdx
																	? "bg-primary/10 text-primary"
																	: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
															}`}
															onMouseEnter={() => setActiveProviderIdx(idx)}
															onFocus={() => setActiveProviderIdx(idx)}
															tabIndex={0}
														>
															{item.name}
														</button>
													</Link>
												</li>
											))}
										</ul>
										<div className="flex flex-col justify-center px-4 min-w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4">
												{activeItem.description}
											</p>
											<Link
												href={activeItem.href}
												className="inline-flex items-center text-xs font-medium text-primary hover:underline"
											>
												Learn More <ChevronRight className="ml-1 h-3 w-3" />
											</Link>
										</div>
										<div className="relative flex items-center justify-center min-w-[160px]">
											<img
												src={getImage(activeProviderIdx)}
												alt={activeItem.name}
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
							item={<Link href="/testimonials">Testimonials</Link>}
							itemKey="Testimonials"
						>
							{(() => {
								const allTestimonialItems =
									navigationData.testimonials.sections.flatMap((section) =>
										section.items.map((item) => ({
											...item,
											section: section.title,
										}))
									);
								const activeItem = allTestimonialItems[activeTestimonialIdx];
								const testimonialImages = [
									"/images/services4.png",
									"/images/services1.png",
									"/images/services2.png",
									"/images/services3.png",
								];
								const getImage = (idx: number) =>
									testimonialImages[idx % testimonialImages.length];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[600px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 min-w-[180px]">
											{allTestimonialItems
												.slice(0, 6)
												.map((item, idx: number) => (
													<li key={item.name}>
														<Link href={item.href}>
															<button
																className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																	idx === activeTestimonialIdx
																		? "bg-primary/10 text-primary"
																		: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
																}`}
																onMouseEnter={() =>
																	setActiveTestimonialIdx(idx)
																}
																onFocus={() => setActiveTestimonialIdx(idx)}
																tabIndex={0}
															>
																{item.name}
															</button>
														</Link>
													</li>
												))}
										</ul>
										<div className="flex flex-col justify-center px-4 min-w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4">
												{activeItem.description}
											</p>
											<Link
												href={activeItem.href}
												className="inline-flex items-center text-xs font-medium text-primary hover:underline"
											>
												Learn More <ChevronRight className="ml-1 h-3 w-3" />
											</Link>
										</div>
										<div className="relative flex items-center justify-center min-w-[160px]">
											<img
												src={getImage(activeTestimonialIdx)}
												alt={activeItem.name}
												className="w-full h-32 object-cover rounded-lg shadow-md"
											/>
										</div>
									</div>
								);
							})()}
						</MenuItem>

						{/* Contact Menu */}
						<MenuItem
							setActive={setActive}
							active={active}
							item={<Link href="/contact">Contact</Link>}
							itemKey="Contact"
						>
							{(() => {
								const allContactItems = navigationData.contact.sections.flatMap(
									(section) =>
										section.items.map((item) => ({
											...item,
											section: section.title,
										}))
								);
								const activeItem = allContactItems[activeContactIdx];
								const contactImages = [
									"/images/hero_image.jpg",
									"/images/services1.png",
									"/images/services2.png",
									"/images/services3.png",
								];
								const getImage = (idx: number) =>
									contactImages[idx % contactImages.length];
								return (
									<div className="grid grid-cols-3 gap-6 min-w-[600px] p-4">
										<ul className="space-y-2 pr-4 border-r border-neutral-200 dark:border-neutral-700 min-w-[180px]">
											{allContactItems.slice(0, 6).map((item, idx: number) => (
												<li key={item.name}>
													<Link href={item.href}>
														<button
															className={`w-full text-left px-2 py-1 rounded transition-colors text-xs font-medium ${
																idx === activeContactIdx
																	? "bg-primary/10 text-primary"
																	: "hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
										<div className="flex flex-col justify-center px-4 min-w-[220px] border-r border-neutral-200 dark:border-neutral-700">
											<h4 className="font-bold text-sm mb-2 text-primary">
												{activeItem.name}
											</h4>
											<p className="text-xs text-neutral-700 dark:text-neutral-300 mb-4">
												{activeItem.description}
											</p>
											<Link
												href={activeItem.href}
												className="inline-flex items-center text-xs font-medium text-primary hover:underline"
											>
												Learn More <ChevronRight className="ml-1 h-3 w-3" />
											</Link>
										</div>
										<div className="relative flex items-center justify-center min-w-[160px]">
											<img
												src={getImage(activeContactIdx)}
												alt={activeItem.name}
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
							<div className="border-t pt-4">
								<h3 className="font-bold text-lg mb-3">Contact</h3>
								<div className="space-y-2 pl-4">
									<HoveredLink href="#contact">Contact Us</HoveredLink>
									<HoveredLink href="/contact/phone">Phone Support</HoveredLink>
									<HoveredLink href="/contact/chat">Live Chat</HoveredLink>
								</div>
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
