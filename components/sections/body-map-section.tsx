"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { InteractiveBodyMap } from "@/components/body-map";
import { BodyPart } from "@/types/body-map-types";
import { Button } from "@/components/ui/button";

export function BodyMapSection() {
	const router = useRouter();
	const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);

	const handlePartClick = useCallback((bodyPart: BodyPart) => {
		setSelectedPart(bodyPart);
	}, []);

	const handleExploreProducts = useCallback(() => {
		if (selectedPart) {
			router.push(`/services/store?joint=${selectedPart.joint}`);
		}
	}, [selectedPart, router]);

	return (
		<section className="py-20 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div
					className="text-center max-w-3xl mx-auto mb-[-300px]"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.8, type: "spring" }}
					style={{ position: "relative", zIndex: 1 }}
				>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
						Shop by Body Part
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-300">
						Click on any area to discover products designed specifically for
						your needs
					</p>
				</motion.div>

				{/* Interactive Body Map */}
				<div
					className="max-w-6xl mx-auto mb-[-400px]"
					style={{ position: "relative", zIndex: 2 }}
				>
					<InteractiveBodyMap onPartClick={handlePartClick} className="" />
				</div>

				{/* Selected Joint Info Card */}
				{selectedPart && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -20, scale: 0.95 }}
						transition={{ duration: 0.4, ease: "easeOut" }}
						className="max-w-2xl mx-auto mt-8 md:mt-16 px-4"
						style={{ position: "relative", zIndex: 20 }}
					>
						<div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950 rounded-2xl p-6 md:p-8 shadow-lg border border-primary/10">
							<div className="text-center mb-6">
								<h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
									Products for Your {selectedPart.label}
								</h3>
								<p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
									Discover specialized gear designed to support and protect your{" "}
									{selectedPart.label.toLowerCase()}
								</p>
							</div>

							<div className="flex justify-center">
								<Button
									onClick={handleExploreProducts}
									size="lg"
									className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 md:px-8 py-4 md:py-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group w-full sm:w-auto"
								>
									View Products
									<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
								</Button>
							</div>
						</div>
					</motion.div>
				)}

				{/* Call to Action - When nothing is selected */}
				{!selectedPart && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.6 }}
						className="text-center mt-8 md:mt-12 px-4"
					>
						<p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6">
							Not sure what you need? Explore our full collection
						</p>
						<Button
							onClick={() => router.push("/services/store")}
							variant="outline"
							size="lg"
							className="group w-full sm:w-auto"
						>
							Browse All Products
							<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
						</Button>
					</motion.div>
				)}
			</div>
		</section>
	);
}
