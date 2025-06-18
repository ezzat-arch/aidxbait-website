"use client";
import React, { useState, useEffect } from "react";
import {
	HoveredLink,
	Menu,
	MenuItem,
	ProductItem,
} from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Menu as MenuIcon, X } from "lucide-react";
import { services } from "../services-data";

export default function NavbarDemo() {
	return (
		<div className="relative w-full flex items-center justify-center">
			<Navbar />
		</div>
	);
}

function Navbar({ className }: { className?: string }) {
	const [active, setActive] = useState<string | null>(null);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeServiceIdx, setActiveServiceIdx] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			setIsScrolled(scrollTop > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

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
					"fixed inset-x-0 mx-auto z-50 transition-all duration-300 max-w-4xl px-4 sm:px-0",
					isScrolled ? "top-0" : "top-4",
					className
				)}
			>
				<Menu setActive={setActive} logo={logo} isScrolled={isScrolled}>
					{/* Desktop Navigation with Dropdowns */}
					<div className="hidden md:flex space-x-4">
						<MenuItem setActive={setActive} active={active} item="Services">
							<div className="flex min-w-[800px] max-w-[1000px]">
								{/* Left column: list of services */}
								<ul className="flex flex-col w-56 border-r pr-4">
									{services.map((service, idx) => (
										<li
											key={service.title}
											className={`cursor-pointer px-4 py-2 rounded transition-colors ${
												activeServiceIdx === idx
													? "bg-primary/10 text-primary font-semibold"
													: "hover:bg-gray-100 dark:hover:bg-gray-800"
											}`}
											onMouseEnter={() => setActiveServiceIdx(idx)}
										>
											<Link
												href={`/services/${service.slug}`}
												className="block w-full h-full"
											>
												{service.title}
											</Link>
										</li>
									))}
								</ul>
								{/* Middle column: details of selected service */}
								<div className="flex-1 pl-6 flex flex-col justify-center max-w-xs border-r pr-6">
									<h4 className="text-lg font-bold mb-1">
										{services[activeServiceIdx].title}
									</h4>
									<p className="text-sm text-neutral-700 dark:text-neutral-300">
										{services[activeServiceIdx].description}
									</p>
								</div>
								{/* Right column: image of selected service */}
								<div className="flex items-center justify-center pl-6 min-w-[180px]">
									<Image
										src={services[activeServiceIdx].image}
										alt={services[activeServiceIdx].title}
										width={120}
										height={80}
										className="rounded-lg object-cover"
									/>
								</div>
							</div>
						</MenuItem>
						<MenuItem setActive={setActive} active={active} item="Our App">
							<div className="flex min-w-[800px] max-w-[1000px]">
								{/* Left column: title */}
								<Link
									href="#app"
									className="w-56 border-r pr-4 flex items-center font-semibold text-primary hover:underline"
								>
									Download the AidXBait App
								</Link>
								{/* Middle column: description */}
								<div className="flex-1 pl-6 flex flex-col justify-center max-w-xs border-r pr-6">
									<p className="text-sm text-neutral-700 dark:text-neutral-300">
										Take control of your orthopedic care journey with our
										comprehensive mobile application. Available for iOS and
										Android devices.
									</p>
								</div>
								{/* Right column: image */}
								<div className="flex items-center justify-center pl-6 min-w-[180px]">
									<Image
										src="/images/hero_image.jpg"
										alt="AidXBait App Interface"
										width={120}
										height={80}
										className="rounded-lg object-cover"
									/>
								</div>
							</div>
						</MenuItem>
						<MenuItem setActive={setActive} active={active} item="Testimonials">
							<div className="flex min-w-[800px] max-w-[1000px]">
								{/* Left column: title */}
								<Link
									href="#testimonials"
									className="w-56 border-r pr-4 flex items-center font-semibold text-primary hover:underline"
								>
									What Our Clients Say
								</Link>
								{/* Middle column: description */}
								<div className="flex-1 pl-6 flex flex-col justify-center max-w-xs border-r pr-6">
									<p className="text-sm text-neutral-700 dark:text-neutral-300">
										"AidXBait made my post-surgery recovery so much easier. The
										home visit scheduling and guided exercises were a game
										changer!"
									</p>
									<span className="mt-2 text-xs text-neutral-500">
										Sarah Johnson, Knee Replacement Patient
									</span>
								</div>
								{/* Right column: image */}
								<div className="flex items-center justify-center pl-6 min-w-[180px]">
									<Image
										src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
										alt="Sarah Johnson"
										width={120}
										height={80}
										className="rounded-lg object-cover"
									/>
								</div>
							</div>
						</MenuItem>
						<MenuItem setActive={setActive} active={active} item="Contact">
							<div className="flex min-w-[800px] max-w-[1000px]">
								{/* Left column: title */}
								<Link
									href="#contact"
									className="w-56 border-r pr-4 flex items-center font-semibold text-primary hover:underline"
								>
									Contact Us
								</Link>
								{/* Middle column: description */}
								<div className="flex-1 pl-6 flex flex-col justify-center max-w-xs border-r pr-6">
									<p className="text-sm text-neutral-700 dark:text-neutral-300">
										Have questions? We're here to help. Reach out to us through
										any of these channels.
									</p>
								</div>
								{/* Right column: image */}
								<div className="flex items-center justify-center pl-6 min-w-[180px]">
									<Image
										src="/images/logo.png"
										alt="AidXBait Logo"
										width={80}
										height={80}
										className="rounded-lg object-contain bg-white"
									/>
								</div>
							</div>
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
					<div className="absolute top-20 left-4 right-4 bg-white dark:bg-black rounded-2xl shadow-xl p-6">
						<nav className="flex flex-col space-y-4">
							{/* Simple mobile links, no dropdowns for mobile */}
							<HoveredLink href="#services">Services</HoveredLink>
							<HoveredLink href="#app">Our App</HoveredLink>
							<HoveredLink href="#testimonials">Testimonials</HoveredLink>
							<HoveredLink href="#contact">Contact</HoveredLink>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
