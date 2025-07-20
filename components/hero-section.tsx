"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const HeroSection = React.forwardRef<
	HTMLElement,
	{
		navbar?: React.ReactNode;
		sentinelRef?: React.RefObject<HTMLDivElement | null>;
	}
>(function HeroSection({ navbar, sentinelRef }, ref) {
	return (
		<section
			ref={ref}
			className="relative min-h-screen h-[100vh] flex items-center bg-cover bg-center bg-no-repeat p-0 m-0"
			style={{ backgroundImage: "url('/images/hero_image.jpg')" }}
		>
			{navbar && <div className="fixed top-0 left-0 w-full z-50">{navbar}</div>}
			<div className="absolute inset-0 bg-black/50 z-0" />
			<div className="container relative z-20 px-4 sm:px-6 lg:px-8">
				<div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center pt-20 sm:pt-24 md:pt-28 lg:pt-0">
					<motion.div
						initial={{ opacity: 0, x: -100 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true, amount: 0.5 }}
						className="flex flex-col gap-6"
					>
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-tight">
							Unlock The Potentials of{" "}
							<span className="text-primary">Home Care</span>
						</h1>
						<p className="text-base sm:text-lg text-white/90 max-w-xl leading-relaxed">
							Stay at Home and order all medical services with a finger click
						</p>
						<div className="flex flex-col sm:flex-row gap-4 mt-4">
							<Button
								size="lg"
								className="bg-primary hover:bg-primary/90 text-white transition-all duration-500 w-full sm:w-auto"
							>
								Sign Up <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-500 w-full sm:w-auto"
							>
								Sign In
							</Button>
						</div>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 100 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true, amount: 0.5 }}
						className="relative flex justify-center items-center h-[300px] sm:h-[400px] lg:h-[500px] mt-8 lg:mt-0 lg:block lg:relative  lg:animate-float"
					>
						<div className="hidden lg:block absolute top-0 -left-14 w-full max-w-xs sm:max-w-md md:max-w-lg h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl transform -rotate-3"></div>
						<div
							className="relative w-full max-w-xs sm:max-w-md md:max-w-lg h-full bg-white rounded-3xl shadow-xl p-4 sm:p-6 flex items-center justify-center mx-auto
							lg:absolute lg:top-4 lg:left-4 lg:w-full lg:h-full lg:p-6 lg:flex lg:items-center lg:justify-center"
						>
							<Image
								src="/images/services4.png"
								alt="Medical Technology and Healthcare Services"
								width={400}
								height={400}
								className="rounded-xl shadow-lg w-full h-full object-cover"
								style={{ minHeight: "250px" }}
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
	);
});
