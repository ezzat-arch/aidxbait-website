"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BodyPart, BodyMapCallbacks } from "@/types/body-map-types";
import { bodyMapConfig } from "@/lib/body-map-config";
import { BodyHotspot } from "./body-hotspot";

interface InteractiveBodyMapProps extends BodyMapCallbacks {
	/** Optional class name for styling */
	className?: string;
	/** Optional: Initially selected body part ID */
	initialSelectedId?: string;
}

export function InteractiveBodyMap({
	className = "",
	initialSelectedId,
	onPartClick,
	onPartHover,
	onPartSelect,
}: InteractiveBodyMapProps) {
	const t = useTranslations("sections.body_map.map");
	const [selectedPartId, setSelectedPartId] = useState<string | null>(
		initialSelectedId || null
	);
	const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

	const handlePartClick = useCallback(
		(bodyPart: BodyPart) => {
			setSelectedPartId(bodyPart.id);
			onPartClick?.(bodyPart);
			onPartSelect?.(bodyPart);
		},
		[onPartClick, onPartSelect]
	);

	const handlePartHover = useCallback(
		(bodyPart: BodyPart | null) => {
			setHoveredPartId(bodyPart?.id || null);
			onPartHover?.(bodyPart);
		},
		[onPartHover]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent, bodyPart: BodyPart) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handlePartClick(bodyPart);
			}
		},
		[handlePartClick]
	);

	return (
		<div className={`w-full max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto ${className}`}>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="relative w-full"
				style={{
					aspectRatio: bodyMapConfig.imageAspectRatio,
				}}
			>
				{/* Background runner image */}
				<div className="relative w-full h-full">
					<Image
						src="/images/axb_runner.png"
						alt={t("image_alt")}
						fill
						className="object-contain"
						priority
						sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1280px"
					/>

					{/* Gradient overlay for better hotspot visibility */}
					<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
				</div>

				{/* Interactive hotspots */}
				<div
					className="absolute inset-0"
					role="group"
					aria-label={t("aria_label")}
				>
					{bodyMapConfig.bodyParts.map((bodyPart, index) => (
						<div
							key={bodyPart.id}
							onKeyDown={(e) => handleKeyDown(e, bodyPart)}
						>
							<BodyHotspot
								bodyPart={bodyPart}
								isSelected={selectedPartId === bodyPart.id}
								isHovered={hoveredPartId === bodyPart.id}
								isDimmed={
									(hoveredPartId !== null && hoveredPartId !== bodyPart.id) ||
									(selectedPartId !== null && selectedPartId !== bodyPart.id)
								}
								onClick={handlePartClick}
								onHover={handlePartHover}
								index={index}
							/>
						</div>
					))}
				</div>
			</motion.div>
		</div>
	);
}

