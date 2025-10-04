"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const UberStyleHeroSection = () => {
	return (
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
								src="/images/services1.png"
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
								Get Medical Care <span className="text-blue-600">at Home</span>,
								On Your Schedule
							</h1>

							{/* Description */}
							<p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
								Book healthcare services from the comfort of home. Get lab
								tests, consultations, and personalized plans—all without
								stepping outside.
							</p>

							{/* CTA Section */}
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
	);
};
