"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { InteractiveBodyMap } from "@/components/body-map";
import { BodyPart } from "@/types/body-map-types";
import { Joint } from "@/lib/store-types";

interface StoreBodyMapSectionProps {
	onJointSelect: (joint: Joint) => void;
	className?: string;
}

/**
 * Body map integration for the store page
 * Shows only when "Support, Braces & Walking Aids" category is active
 * Clicking a body part directly filters products by joint
 */
export function StoreBodyMapSection({
	onJointSelect,
	className = "",
}: StoreBodyMapSectionProps) {
	const handlePartClick = useCallback(
		(bodyPart: BodyPart) => {
			// Map body part ID to joint type
			// Body part IDs from body-map-config match joint names
			const jointMap: Record<string, Joint> = {
				neck: "neck",
				shoulder: "shoulder",
				"shoulder-left": "shoulder",
				"shoulder-right": "shoulder",
				elbow: "elbow",
				"elbow-left": "elbow",
				"elbow-right": "elbow",
				wrist: "wrist",
				"wrist-left": "wrist",
				"wrist-right": "wrist",
				back: "back",
				"lower-back": "back",
				hip: "hip",
				"hip-left": "hip",
				"hip-right": "hip",
				knee: "knee",
				"knee-left": "knee",
				"knee-right": "knee",
				ankle: "ankle",
				"ankle-left": "ankle",
				"ankle-right": "ankle",
				thigh: "thigh",
				calf: "calf",
				abdomen: "abdomen",
				chest: "chest",
			};

			const joint = jointMap[bodyPart.id] || ("general" as Joint);
			onJointSelect(joint);
		},
		[onJointSelect]
	);

	return (
		<section
			className={`py-12 bg-gradient-to-b from-background via-background to-muted/30 ${className}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div
					className="text-center max-w-3xl mx-auto mb-[-60px] sm:mb-[-100px] md:mb-[-150px] lg:mb-[-200px]"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.8, type: "spring" }}
				>
					<h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
						Find Products by Body Part
					</h2>
					<p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
						Click on any area to filter products for that specific body part
					</p>
				</motion.div>

				{/* Interactive Body Map */}
				<div className="max-w-6xl mx-auto mb-[-100px] sm:mb-[-150px] md:mb-[-250px] lg:mb-[-400px]">
					<InteractiveBodyMap onPartClick={handlePartClick} className="" />
				</div>
			</div>
		</section>
	);
}
