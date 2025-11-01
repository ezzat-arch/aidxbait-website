"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { InteractiveBodyMap } from "@/components/body-map";
import { JointSelectionModal } from "@/components/body-map/joint-selection-modal";
import { BodyPart } from "@/types/body-map-types";
import { Button } from "@/components/ui/button";

export function BodyMapSection() {
	const router = useRouter();
	const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);

	const handlePartClick = useCallback((bodyPart: BodyPart) => {
		setSelectedPart(bodyPart);
	}, []);

	return (
		<section className="py-20 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div
					className="text-center max-w-3xl mx-auto mb-[-100px] md:mb-[-200px] lg:mb-[-300px]"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.8, type: "spring" }}
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
				<div className="max-w-6xl mx-auto mb-[-150px] md:mb-[-250px] lg:mb-[-400px]">
					<InteractiveBodyMap onPartClick={handlePartClick} className="" />
				</div>

				{/* Joint Selection Modal/Drawer */}
				<JointSelectionModal
					isOpen={!!selectedPart}
					onOpenChange={(open) => !open && setSelectedPart(null)}
					selectedPart={selectedPart}
				/>

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
