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

	const navLinks = [
		{ href: "#services", label: "Services" },

		{ href: "#app", label: "Our App" },
		{ href: "#testimonials", label: "Testimonials" },
		{ href: "#contact", label: "Contact" },
	];

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
					{/* Desktop Navigation */}
					<div className="hidden md:flex space-x-4">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="font-inter text-slate-800 dark:text-white hover:text-primary transition-colors py-2 text-md lg:text-lg whitespace-nowrap"
								style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}
							>
								{link.label}
							</Link>
						))}
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
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="font-inter text-slate-800 dark:text-slate-700 hover:text-primary transition-colors py-2 text-lg"
									style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{link.label}
								</Link>
							))}
						</nav>
					</div>
				</div>
			)}
		</>
	);
}
