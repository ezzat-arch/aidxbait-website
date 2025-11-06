"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";

export const HeroSection = React.forwardRef<
	HTMLElement,
	{
		navbar?: React.ReactNode;
		sentinelRef?: React.RefObject<HTMLDivElement | null>;
	}
>(function HeroSection({ navbar, sentinelRef }, ref) {
	const { user, loading } = useAuth();
	return (
		<div className="flex flex-col">
			{/* First Hero Section */}
			<section
				ref={ref}
				className="relative min-h-screen hero-height flex items-center bg-cover bg-center bg-no-repeat p-0 m-0"
				style={{ backgroundImage: "url('/images/hero_image.jpg')" }}
			>
				{navbar && (
					<div className="fixed top-0 left-0 w-full z-50">{navbar}</div>
				)}
				<div className="absolute inset-0 bg-black/50 z-0" />
				<div className="container relative z-20 px-4 sm:px-6 lg:px-8">
					<div className="grid gap-4 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-center pt-16 sm:pt-20 md:pt-24 lg:pt-0 hero-content">
						<motion.div
							initial={{ opacity: 0, x: -100 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.7 }}
							viewport={{ once: true, amount: 0.5 }}
							className="flex flex-col gap-4 sm:gap-6 text-center lg:text-left items-center lg:items-start"
						>
							<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white font-bold tracking-tight leading-tight hero-heading">
								Unlock
								<br />
								The Potentials of
								<br />
								<span className="text-primary">Home Care</span>
							</h1>
							<p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl leading-relaxed hero-description">
								Stay at Home and order all medical services with a finger click
							</p>
							<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 hero-badges justify-center lg:justify-start">
								<Link
									href="/download/ios"
									className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
								>
									<img
										src="/images/app-store-badge-black.svg"
										alt="Download on the App Store"
										className="h-[40px] sm:h-[45px] md:h-[50px] w-auto"
									/>
								</Link>
								<Link
									href="/download/android"
									className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
								>
									<img
										src="/images/google-play-badge.png"
										alt="Get it on Google Play"
										className="h-[40px] sm:h-[45px] md:h-[50px] w-auto"
									/>
								</Link>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 100 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.7 }}
							viewport={{ once: true, amount: 0.5 }}
							className="relative flex justify-center items-center h-[250px] sm:h-[300px] md:h-[350px] lg:h-[450px] mt-6 sm:mt-8 lg:mt-0 lg:block lg:relative lg:animate-float hero-image-container"
						>
							<div className="hidden lg:block absolute top-0 -left-14 w-full max-w-xs sm:max-w-md md:max-w-lg h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl transform -rotate-3"></div>
							<div
								className="relative w-full max-w-xs sm:max-w-md md:max-w-lg h-full bg-white rounded-3xl shadow-xl p-4 sm:p-6 flex items-center justify-center mx-auto
								lg:absolute lg:top-4 lg:left-4 lg:w-full lg:h-full lg:p-6 lg:flex lg:items-center lg:justify-center"
							>
								<Image
									src="/images/hero_image_in.png"
									alt="Patient connecting with healthcare professional at home"
									width={400}
									height={400}
									className="rounded-xl shadow-lg w-full h-full object-cover"
									style={{ minHeight: "200px" }}
								/>
							</div>
						</motion.div>
					</div>
				</div>
				<div
					className="absolute top-0 left-0 w-full z-40"
					style={{ height: 1 }}
					ref={sentinelRef}
				/>
			</section>

			{/* Second Hero Section - Uber Style */}
			<section className="py-16 lg:py-24 bg-white">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
					<div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
						{/* Left side - Image */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, ease: "easeOut" }}
							viewport={{ once: true, amount: 0.3 }}
							className="w-full lg:w-1/2 order-1 lg:order-1"
						>
							<div className="relative max-w-sm mx-auto lg:max-w-md lg:mx-0">
								<Image
									src="/images/logo_phone.png"
									alt="Home medical care - Doctor visiting patient at home"
									width={400}
									height={300}
									className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[3/3]"
									priority
								/>
								{/* Subtle gradient overlay for better text contrast if needed */}
								<div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-blue-400/20 rounded-2xl pointer-events-none" />
							</div>
						</motion.div>

						{/* Right side - Content */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
							viewport={{ once: true, amount: 0.3 }}
							className="w-full lg:w-1/2 order-2 lg:order-2"
						>
							<div className="lg:pl-8">
								{/* Headline */}
								<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
									Get Medical Care{" "}
									<span className="text-blue-600">at Home</span>, On Your
									Schedule
								</h1>

								{/* Description */}
								<p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
									Book healthcare services from the comfort of home. Get lab
									tests, consultations, and personalized plans—all without
									stepping outside.
								</p>

								{/* CTA Section */}
								{!loading && !user && (
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
										{/* Primary CTA Button */}
										<Link
											href="/app/ios"
											className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group"
										>
											Get Started
											<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
										</Link>

										{/* Secondary Link */}
										<Link
											href="/contact/general"
											className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200"
										>
											Already have an account?{" "}
											<span className="font-semibold">Log in</span>
										</Link>
									</div>
								)}

								{/* Optional: Additional trust indicators */}
								<div className="mt-10 pt-8 border-t border-gray-200">
									<div className="flex items-center gap-8 text-sm text-gray-500">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-green-500 rounded-full"></div>
											<span>Licensed Professionals</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
											<span>24/7 Support</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
											<span>Secure & Private</span>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	);
});
