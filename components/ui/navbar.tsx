"use client";
import React, { ReactNode, useState, useEffect } from "react";
import {
	HoveredLink,
	Menu,
	MenuItem,
	ProductItem,
} from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
	MenuIcon,
	X,
	ChevronRight,
	ChevronDown,
	Store,
	ShoppingBag,
	ShoppingCart,
	Package,
	MapPin,
	Settings,
	LogOut,
} from "lucide-react";
import { LocaleSwitcher, LocaleSwitcherMobile } from "./locale-switcher";
import { CartIcon } from "@/components/store/CartIcon";
import { UserNav } from "@/components/layout/user-nav";
import { useCart } from "@/contexts/cart-context";
import { useTranslations } from "next-intl";

// Coming Soon Text Component (for dropdown items)
const ComingSoonText = () => {
	const t = useTranslations("ui.navbar.text");
	return (
		<span className="block text-[10px] font-light text-blue-600 italic mt-0.5">
			{t("coming_soon")}
		</span>
	);
};

// New navigation data structure
const homeVisitsItems = [
	{
		name: "Physical Therapy",
		href: "/home-visits/physical-therapy",
		description: "Professional physical therapy sessions at your home.",
		comingSoon: true,
	},
	{
		name: "Specialist Doctors",
		href: "/home-visits/specialist-doctors",
		description: "Consult with specialist doctors in the comfort of your home.",
		comingSoon: true,
	},
	{
		name: "Nursing",
		href: "/home-visits/nursing",
		description: "Professional nursing care at your doorstep.",
		comingSoon: true,
	},
	{
		name: "Imaging",
		href: "/home-visits/imaging",
		description: "Medical imaging services at home.",
		comingSoon: true,
	},
	{
		name: "Lab Services",
		href: "/home-visits/lab-services",
		description: "Laboratory tests done from home.",
		comingSoon: true,
	},
];

const storeItems = [
	{
		name: "Support, Braces\n& Walking Aids",
		href: "/services/store/",
		description: "Browse our collection of support braces and walking aids.",
		comingSoon: false,
	},
	{
		name: "Blood Glucose Monitoring",
		href: "/services/store/",
		description: "Shop blood glucose monitors and testing supplies.",
		comingSoon: false,
		category: "Medical Devices",
	},
	{
		name: "Blood Pressure Monitoring",
		href: "/services/store/",
		description: "Shop blood pressure monitors and equipment.",
		comingSoon: false,
		category: "Medical Devices",
	},
	{
		name: "Oximeters",
		href: "/services/store/",
		description: "Shop pulse oximeters for oxygen monitoring.",
		comingSoon: false,
		category: "Medical Devices",
	},
	{
		name: "Thermometers",
		href: "/services/store/",
		description: "Shop digital and infrared thermometers.",
		comingSoon: false,
		category: "Medical Devices",
	},
	{
		name: "Rental of Equipment",
		href: "/services/store/",
		description: "Rent medical equipment for short or long-term use.",
		comingSoon: false,
	},
];

const Navbar = ({ className }: { className?: string }) => {
	const tNav = useTranslations("ui.navbar.text");
	const tNavAlt = useTranslations("ui.navbar.attr.alt");
	const tServicesDesc = useTranslations("sections.services.data.description");
	const tFooterAlt = useTranslations("layout.footer.attr.alt");
	const tUser = useTranslations("layout.user.text");
	const tProfileLayout = useTranslations("profile.layout.text");
	const tLogin = useTranslations("login.text");
	const tCommon = useTranslations("common.text");
	const [active, setActive] = useState<string | null>(null);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeHomeVisitsIdx, setActiveHomeVisitsIdx] = useState(0);
	const [activeStoreIdx, setActiveStoreIdx] = useState(0);
	const [isMounted, setIsMounted] = useState(false);
	const [currentLanguage, setCurrentLanguage] = useState("En");
	const [expandedSections, setExpandedSections] = useState<Set<string>>(
		new Set(["home-visits"])
	);
	const { cart, toggleCart } = useCart();

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

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(section)) {
				newSet.delete(section);
			} else {
				newSet.add(section);
			}
			return newSet;
		});
	};

	const handleCartClick = () => {
		setIsMobileMenuOpen(false);
		toggleCart();
	};

	const logo = (
		<Link href="/" className="flex items-center gap-2">
			<Image
				src="/images/logo.png"
				alt={tNavAlt("aidxbait_logo")}
				width={180}
				height={90}
				className="object-contain w-[130px] h-[65px] sm:w-[140px] sm:h-[70px] md:w-[160px] md:h-[80px] lg:w-[180px] lg:h-[90px] logo-responsive"
				priority
			/>
		</Link>
	);

	return (
		<>
			<div
				className={cn(
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-8xl px-2 sm:px-4 md:px-6",
					isScrolled ? "top-0" : "top-4",
					className
				)}
			>
				<nav
					className={cn(
						"border border-transparent shadow-input flex items-center transition-all duration-200 z-50 navbar-height",
						isScrolled
							? "fixed top-0 left-0 w-full rounded-none backdrop-blur-md bg-white/90 dark:bg-slate-900/90 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-1.5 sm:py-2 justify-between shadow-2xl drop-shadow-lg"
							: "relative rounded-full bg-white/95 dark:bg-black/95 dark:border-white/[0.2] backdrop-blur-sm px-4 sm:px-6 md:px-8 lg:px-10 py-1.5 sm:py-1 md:py-1 mx-auto mt-4 max-w-8xl justify-between shadow-2xl drop-shadow-lg"
					)}
				>
					{/* Logo */}
					<div className="flex-shrink-0 ltr:mr-1 ltr:sm:mr-2 ltr:md:mr-4 ltr:lg:mr-8 rtl:ml-1 rtl:sm:ml-2 rtl:md:ml-4 rtl:lg:ml-8">
						{logo}
					</div>

					{/* Left Menu Items */}
					<div className="hidden lg:flex items-center ltr:space-x-4 ltr:xl:space-x-6 rtl:space-x-reverse rtl:space-x-4 rtl:xl:space-x-6">
						{/* Home Visits Menu */}
						<div
							onMouseEnter={() => setActive("HomeVisits")}
							onMouseLeave={() => setActive(null)}
							className="relative"
						>
							<span className="text-sm px-3 py-3 font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm cursor-pointer text-center flex items-center justify-center">
								<span className="relative inline-block">
									<span>{tNav("home_visits")}</span>
									<span className="absolute -bottom-3.5 ltr:right-0 rtl:left-0 text-[10px] font-medium text-blue-600 italic whitespace-nowrap">
										{tNav("coming_soon")}
									</span>
								</span>
							</span>
							{active === "HomeVisits" && (
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 z-50">
									<div className="bg-white shadow-2xl border border-gray-100 rounded-xl p-6 w-[680px] animate-in fade-in slide-in-from-top-2 duration-200">
										<div className="flex">
											<ul className="space-y-1 pr-4 border-r border-gray-200 w-[220px] flex-shrink-0">
												{homeVisitsItems.map((item, idx) => (
													<li key={item.name}>
														<Link href={item.href}>
															<button
																className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
																	idx === activeHomeVisitsIdx
																		? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
																		: "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
																}`}
																onMouseEnter={() => setActiveHomeVisitsIdx(idx)}
																onFocus={() => setActiveHomeVisitsIdx(idx)}
																tabIndex={0}
															>
																<div>
																	{item.name}
																	{item.comingSoon && <ComingSoonText />}
																</div>
															</button>
														</Link>
													</li>
												))}
											</ul>
											<div className="flex flex-col justify-center px-4 w-[200px] border-r border-gray-100 flex-shrink-0">
												<h4 className="font-semibold text-base mb-2 text-gray-900 leading-tight">
													{
														[
															tNav("home_physical_therapy"),
															tNav("home_doctor_visits"),
															tNav("home_nursing"),
															tNav("home_imaging"),
															tNav("home_lab_tests"),
														][activeHomeVisitsIdx]
													}
												</h4>
												<p className="text-xs text-gray-600 mb-4 leading-relaxed">
													{
														[
															tServicesDesc(
																"licensed_physical_therapists_provide_one"
															),
															tServicesDesc("licensed_doctors_provide_one"),
															tServicesDesc(
																"professional_nurses_available_for_home"
															),
															tServicesDesc("portable_x_rays_and_ultrasounds"),
															tServicesDesc("we_send_a_nurse_to"),
														][activeHomeVisitsIdx]
													}
												</p>
												<Link
													href={homeVisitsItems[activeHomeVisitsIdx].href}
													className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
												>
													{tNav("learn_more")}{" "}
													<ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
												</Link>
											</div>
											<div className="relative w-[240px] bg-gradient-to-br from-blue-50 to-blue-100/50 ml-4 rounded-xl p-4 shadow-inner">
												<img
													src="/images/services2.png"
													alt={tFooterAlt("aidxbait_logo")}
													className="w-full h-full object-cover rounded-lg shadow-md border border-white"
													style={{ minHeight: "140px" }}
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Online Consultations */}
						<Link
							href="/services/online-consultations"
							onMouseEnter={() => setActive(null)}
							className="text-sm px-3 py-3 font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm flex items-center justify-center text-center"
						>
							<span className="relative inline-block">
								<span>{tNav("online_video_consultations")}</span>
								<span className="absolute -bottom-3.5 ltr:right-0 rtl:left-0 text-[10px] font-medium text-blue-600 italic whitespace-nowrap">
									{tNav("coming_soon")}
								</span>
							</span>
						</Link>

						{/* Exercise Programs */}
						<Link
							href="/services/exercise-programs"
							onMouseEnter={() => setActive(null)}
							className="text-sm px-3 py-1.5 font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm text-center flex items-center justify-center"
						>
							{tNav("home_exercise_programs")}
						</Link>

						{/* Store Menu */}
						<div
							onMouseEnter={() => setActive("Store")}
							onMouseLeave={() => setActive(null)}
							className="relative"
						>
							<Link
								href="/services/store/"
								className="text-sm px-3 py-1.5 font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm cursor-pointer text-center flex items-center justify-center"
							>
								{tNav("store")}
							</Link>
							{active === "Store" && (
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 z-50">
									<div className="bg-white shadow-2xl border border-gray-100 rounded-xl p-6 w-[680px] animate-in fade-in slide-in-from-top-2 duration-200">
										<div className="flex">
											<ul className="space-y-1 pr-4 border-r border-gray-200 w-[220px] flex-shrink-0">
												{storeItems
													.filter(
														(item) =>
															!item.category &&
															item.name !== "Rental of Equipment"
													)
													.map((item, idx) => (
														<li key={item.name}>
															<Link href={item.href}>
																<button
																	className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium whitespace-pre-line ${
																		idx === activeStoreIdx
																			? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
																			: "hover:bg-gray-50 text-gray-700 hover:shadow-sm"
																	}`}
																	onMouseEnter={() => setActiveStoreIdx(idx)}
																	onFocus={() => setActiveStoreIdx(idx)}
																	tabIndex={0}
																>
																	{item.name}
																</button>
															</Link>
														</li>
													))}
												<li>
													<div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
														{tNav("medical_devices")}
													</div>
													{storeItems
														.filter(
															(item) => item.category === "Medical Devices"
														)
														.map((item) => (
															<Link key={item.name} href={item.href}>
																<button className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium hover:bg-gray-50 text-gray-700 hover:shadow-sm pl-5">
																	{item.name}
																</button>
															</Link>
														))}
												</li>
												{storeItems
													.filter((item) => item.name === "Rental of Equipment")
													.map((item) => (
														<li key={item.name}>
															<Link href={item.href}>
																<button className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium hover:bg-gray-50 text-gray-700 hover:shadow-sm">
																	{item.name}
																</button>
															</Link>
														</li>
													))}
											</ul>
											<div className="flex flex-col justify-center px-4 w-[200px] border-r border-gray-100 flex-shrink-0">
												<h4 className="font-semibold text-base mb-2 text-gray-900 leading-tight whitespace-pre-line">
													{storeItems.filter(
														(item) =>
															!item.category &&
															item.name !== "Rental of Equipment"
													)[activeStoreIdx]?.name ||
														"Support, Braces\n& Walking Aids"}
												</h4>
												<p className="text-xs text-gray-600 mb-4 leading-relaxed">
													{storeItems.filter(
														(item) =>
															!item.category &&
															item.name !== "Rental of Equipment"
													)[activeStoreIdx]?.description ||
														"Browse our collection"}
												</p>
												<Link
													href={
														storeItems.filter(
															(item) =>
																!item.category &&
																item.name !== "Rental of Equipment"
														)[activeStoreIdx]?.href || "/services/store/"
													}
													className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
												>
													{tNav("shop_now")}{" "}
													<ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
												</Link>
											</div>
											<div className="relative w-[240px] bg-gradient-to-br from-blue-50 to-blue-100/50 ml-4 rounded-xl p-4 shadow-inner">
												<img
													src="/images/services1.png"
													alt={tNav("store")}
													className="w-full h-full object-cover rounded-lg shadow-md border border-white"
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
					<div className="hidden lg:flex items-center ltr:space-x-4 ltr:xl:space-x-6 rtl:space-x-reverse rtl:space-x-4 rtl:xl:space-x-6 ltr:ml-8 ltr:lg:ml-12 rtl:mr-8 rtl:lg:mr-12">
						{/* Contact & About - Stacked Vertically */}
						<div className="flex flex-col gap-1">
							{/* Contact */}
							<Link
								href="/contact"
								onMouseEnter={() => setActive(null)}
								className="text-sm px-3 py-1 font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm text-center whitespace-nowrap"
							>
								{tNav("contact")}
							</Link>

							{/* About */}
							<div
								onMouseEnter={() => setActive("About")}
								onMouseLeave={() => setActive(null)}
								className="relative"
							>
								<span className="text-sm px-3 py-1 font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm cursor-pointer text-center whitespace-nowrap block">
									{tNav("about")}
								</span>
								{active === "About" && (
									<div className="absolute top-full right-0 pt-2 z-50">
										<div className="bg-white shadow-2xl border border-gray-100 rounded-xl p-6 w-[480px] animate-in fade-in slide-in-from-top-2 duration-200">
											<div className="flex flex-col gap-4">
												<div>
													<h4 className="font-semibold text-base mb-2 text-gray-900">
														{tNav("our_vision")}
													</h4>
													<p className="text-sm text-gray-600 leading-relaxed">
														{tNav("to_revolutionize_healthcare_delivery_by")}
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-base mb-2 text-gray-900">
														{tNav("our_mission")}
													</h4>
													<p className="text-sm text-gray-600 leading-relaxed">
														{tNav("we_are_committed_to_providing")}
													</p>
												</div>
											</div>
										</div>
									</div>
								)}
					</div>
				</div>

				{/* Language Switcher */}
				<LocaleSwitcher />

				{/* Cart Icon */}
				<CartIcon />

						{/* User Navigation */}
						<UserNav />
					</div>

					{/* Mobile Menu Button */}
					<button
						className="lg:hidden cursor-pointer text-black dark:text-white"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					>
						{isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
					</button>
				</nav>
			</div>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
					<div className="absolute top-32 left-4 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
						{/* Scrollable Menu Content */}
						<div className="flex-1 overflow-y-auto">
							<nav className="p-3">
								{/* Store and Cart Buttons */}
								<div className="flex gap-2 mb-3">
									{/* Store Button - Takes most space */}
									<Link
										href="/services/store"
										onClick={() => setIsMobileMenuOpen(false)}
										className="flex-1 flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg transition-all duration-200"
									>
										<div className="flex items-center gap-2.5">
											<div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
												<ShoppingBag className="w-4 h-4" />
											</div>
											<div>
												<h3 className="font-bold text-sm">
													{tNav("medical_store")}
												</h3>
												<p className="text-[10px] text-blue-100">
													{tNav("shop_supplies")}
												</p>
											</div>
										</div>
										<ChevronRight className="w-4 h-4" />
									</Link>

									{/* Cart Button - Square, compact */}
									<button
										onClick={handleCartClick}
										className="relative w-20 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-1"
									>
										<ShoppingCart className="w-5 h-5" />
										<span className="text-[10px] font-medium">
											{tCommon("cart")}
										</span>
										{cart.itemCount > 0 && (
											<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
												{cart.itemCount > 9 ? "9+" : cart.itemCount}
											</span>
										)}
									</button>
								</div>

								{/* Home Visits Section */}
								<div className="border-b border-gray-100 dark:border-gray-800">
									<button
										onClick={() => toggleSection("home-visits")}
										className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
									>
										<h3 className="font-bold text-sm text-gray-900 dark:text-white">
											{tNav("home_visits")}
										</h3>
										<ChevronDown
											className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
												expandedSections.has("home-visits") ? "rotate-180" : ""
											}`}
										/>
									</button>
									{expandedSections.has("home-visits") && (
										<div className="px-2 pb-3 space-y-1">
											{homeVisitsItems.map((item) => (
												<div key={item.name} className="flex flex-col">
													<HoveredLink
														href={item.href}
														onClick={() => setIsMobileMenuOpen(false)}
													>
														{item.name}
													</HoveredLink>
													{item.comingSoon && (
														<span className="text-[10px] font-light text-blue-600 italic ml-3 mt-0.5">
															coming soon
														</span>
													)}
												</div>
											))}
										</div>
									)}
								</div>

								{/* Online Consultations */}
								<div className="border-b border-gray-100 dark:border-gray-800">
									<Link
										href="/services/online-consultations"
										onClick={() => setIsMobileMenuOpen(false)}
										className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
									>
										<div className="flex flex-col">
											<h3 className="font-bold text-sm text-gray-900 dark:text-white">
												{tNav("online_video_consultations")}
											</h3>
											<span className="text-[10px] font-light text-blue-600 italic mt-0.5">
												{tNav("coming_soon")}
											</span>
										</div>
										<ChevronRight className="w-4 h-4 text-gray-500" />
									</Link>
								</div>

								{/* Exercise Programs */}
								<div className="border-b border-gray-100 dark:border-gray-800">
									<Link
										href="/services/exercise-programs"
										onClick={() => setIsMobileMenuOpen(false)}
										className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
									>
										<h3 className="font-bold text-sm text-gray-900 dark:text-white">
											{tNav("home_exercise_programs")}
										</h3>
										<ChevronRight className="w-4 h-4 text-gray-500" />
									</Link>
								</div>

								{/* Contact */}
								<div className="border-b border-gray-100 dark:border-gray-800">
									<Link
										href="/contact"
										onClick={() => setIsMobileMenuOpen(false)}
										className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
									>
										<h3 className="font-bold text-sm text-gray-900 dark:text-white">
											{tNav("contact")}
										</h3>
										<ChevronRight className="w-4 h-4 text-gray-500" />
									</Link>
								</div>

								{/* About */}
								<div className="border-b border-gray-100 dark:border-gray-800">
									<Link
										href="/about"
										onClick={() => setIsMobileMenuOpen(false)}
										className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
									>
										<h3 className="font-bold text-sm text-gray-900 dark:text-white">
											{tNav("about")}
										</h3>
										<ChevronRight className="w-4 h-4 text-gray-500" />
									</Link>
								</div>

								{/* My Account Section */}
								<div>
									<button
										onClick={() => toggleSection("account")}
										className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
									>
										<h3 className="font-bold text-sm text-gray-900 dark:text-white">
											{tProfileLayout("my_account")}
										</h3>
										<ChevronDown
											className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
												expandedSections.has("account") ? "rotate-180" : ""
											}`}
										/>
									</button>
									{expandedSections.has("account") && (
										<div className="px-2 pb-3 space-y-1">
											<Link
												href="/profile/orders"
												onClick={() => setIsMobileMenuOpen(false)}
												className="flex items-center gap-3 py-2.5 px-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150 font-medium text-sm"
											>
												<Package className="w-4 h-4" />
												<span>{tUser("my_orders")}</span>
											</Link>
											<Link
												href="/profile/addresses"
												onClick={() => setIsMobileMenuOpen(false)}
												className="flex items-center gap-3 py-2.5 px-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150 font-medium text-sm"
											>
												<MapPin className="w-4 h-4" />
												<span>{tUser("my_addresses")}</span>
											</Link>
											<Link
												href="/profile/settings"
												onClick={() => setIsMobileMenuOpen(false)}
												className="flex items-center gap-3 py-2.5 px-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-150 font-medium text-sm"
											>
												<Settings className="w-4 h-4" />
												<span>{tUser("settings")}</span>
											</Link>
											<button
												onClick={() => {
													setIsMobileMenuOpen(false);
													// Add sign out logic here
												}}
												className="w-full flex items-center gap-3 py-2.5 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150 font-medium text-sm"
											>
												<LogOut className="w-4 h-4" />
												<span>{tUser("sign_out")}</span>
											</button>
										</div>
									)}
								</div>
							</nav>
						</div>

						{/* Footer with Controls */}
						<div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-800/50 p-3.5">
							<div className="flex items-center justify-between gap-4">
								<div className="text-xs">
									<p className="font-semibold text-gray-900 dark:text-white">
										{tLogin("welcome_back")}
									</p>
									<p className="text-[10px] text-gray-500 dark:text-gray-400">
										{tNav("language")}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-medium text-gray-600 dark:text-gray-400" />
									<LocaleSwitcherMobile />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const NavbarDiv = () => {
	return (
		<div className="relative w-full flex items-center justify-center">
			<Navbar className="top-2" />
		</div>
	);
};

export default NavbarDiv;
