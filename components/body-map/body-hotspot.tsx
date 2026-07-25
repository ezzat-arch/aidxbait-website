"use client";

import { motion } from "framer-motion";
import { BodyPart } from "@/types/body-map-types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

interface BodyHotspotProps {
	/** The body part this hotspot represents */
	bodyPart: BodyPart;
	/** Whether this hotspot is currently selected */
	isSelected: boolean;
	/** Whether this hotspot is currently hovered */
	isHovered: boolean;
	/** Whether to dim this hotspot (when another is hovered) */
	isDimmed: boolean;
	/** Click handler */
	onClick: (bodyPart: BodyPart) => void;
	/** Hover handler */
	onHover: (bodyPart: BodyPart | null) => void;
	/** Index for stagger animation */
	index: number;
}

export function BodyHotspot({
	bodyPart,
	isSelected,
	isHovered,
	isDimmed,
	onClick,
	onHover,
	index,
}: BodyHotspotProps) {
	const t = useTranslations();
	const translatedLabel = t(bodyPart.translationKey);
	
	return (
		<TooltipProvider delayDuration={75}>
			<Tooltip>
				<TooltipTrigger asChild>
					<motion.button
						initial={{ opacity: 0, scale: 0 }}
						animate={{
							opacity: isSelected ? 1 : isDimmed ? 0.6 : 1,
							scale: isSelected ? 1.4 : isHovered ? 1.2 : 1,
						}}
						whileHover={{ scale: isSelected ? 1.5 : 1.3 }}
						whileTap={{ scale: 0.95 }}
						transition={{
							duration: 0.3,
							delay: index * 0.05,
						}}
						onClick={() => onClick(bodyPart)}
						onMouseEnter={() => onHover(bodyPart)}
						onMouseLeave={() => onHover(null)}
						className="absolute cursor-pointer focus:outline-none rounded-full"
						style={{
							left: `${bodyPart.coordinates.x}%`,
							top: `${bodyPart.coordinates.y}%`,
							transform: "translate(-50%, -50%)",
						}}
						aria-label={
							bodyPart.descriptionKey
								? `${translatedLabel} - ${t(bodyPart.descriptionKey)}`
								: translatedLabel
						}
						role="button"
						tabIndex={0}
					>
						{/* Outer pulsing ring */}
						<motion.div
							className={`absolute inset-0 rounded-full ${
								isSelected
									? "bg-orange-500/40"
									: isHovered
									? "bg-yellow-500/30"
									: "bg-orange-500/30"
							}`}
							animate={{
								scale: [1, 1.5, 1],
								opacity: [0.6, 0, 0.6],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>

					{/* Main hotspot circle */}
					<div
						className={`relative rounded-full transition-all duration-300 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 ${
							isSelected
								? "bg-orange-600 shadow-lg shadow-orange-600/50 ring-2 ring-white"
								: isHovered
								? "bg-yellow-500 shadow-md shadow-yellow-500/50 ring-2 ring-white"
								: "bg-orange-500 hover:bg-orange-600 ring-1 ring-white/50"
						}`}
					>
							{/* Inner glow */}
							<div
								className={`absolute inset-0 rounded-full ${
									isSelected || isHovered ? "animate-pulse" : ""
								}`}
								style={{
									background:
										isSelected || isHovered
											? "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)"
											: "transparent",
								}}
							/>
						</div>

					{/* Touch target for mobile (invisible but increases clickable area) */}
					<div
						className="absolute inset-0 rounded-full md:hidden w-10 h-10"
						style={{
							transform: "translate(-50%, -50%)",
							left: "50%",
							top: "50%",
						}}
					/>
				</motion.button>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				className="bg-gray-900 text-white px-3 py-2 text-sm font-medium"
			>
				<p>{translatedLabel}</p>
				{bodyPart.side && (
					<p className="text-xs text-gray-300 capitalize">{bodyPart.side}</p>
				)}
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
	);
}
