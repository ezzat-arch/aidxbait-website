"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Apple, Play, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export const AppDownloadSection = () => {
	return (
		<section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
					>
						Get Started with AidXBait
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						viewport={{ once: true }}
						className="text-lg text-gray-600 max-w-2xl mx-auto"
					>
						Download our app to access all medical services at your fingertips.
						Each button below takes you to the app download page for your
						device.
					</motion.p>
				</div>

				<div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						viewport={{ once: true }}
						className="w-full sm:w-auto"
					>
						<Button
							size="lg"
							className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
							onClick={() => window.open("/app/ios", "_blank")}
						>
							<Apple className="h-6 w-6" />
							<div className="text-left">
								<div className="text-xs opacity-90">Download on the</div>
								<div className="text-sm font-semibold">App Store</div>
							</div>
						</Button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						viewport={{ once: true }}
						className="w-full sm:w-auto"
					>
						<Button
							size="lg"
							className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
							onClick={() => window.open("/app/android", "_blank")}
						>
							<Play className="h-6 w-6" />
							<div className="text-left">
								<div className="text-xs opacity-90">Get it on</div>
								<div className="text-sm font-semibold">Google Play</div>
							</div>
						</Button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						viewport={{ once: true }}
						className="w-full sm:w-auto"
					>
						<Button
							size="lg"
							variant="outline"
							className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
							onClick={() => window.open("/app/web", "_blank")}
						>
							<Smartphone className="h-6 w-6" />
							<div className="text-left">
								<div className="text-xs opacity-90">Access via</div>
								<div className="text-sm font-semibold">Web App</div>
							</div>
						</Button>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.5 }}
					viewport={{ once: true }}
					className="text-center mt-8"
				>
					<p className="text-sm text-gray-500">
						Available on all platforms • Secure • Easy to use
					</p>
				</motion.div>
			</div>
		</section>
	);
};
