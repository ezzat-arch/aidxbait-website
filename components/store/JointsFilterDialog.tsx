"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { bodyPartsForFilter } from "@/lib/body-map-config";
import { BodyPart } from "@/types/body-map-types";
import { Joint } from "@/lib/store-types";
import { useTranslations } from "next-intl";

interface JointsFilterDialogProps {
	selected: Joint[];
	onChange: (selected: Joint[]) => void;
	buttonClassName?: string;
}

export function JointsFilterDialog({
	selected,
	onChange,
	buttonClassName = "w-[200px] h-12 justify-start text-left font-normal",
}: JointsFilterDialogProps) {
	const t = useTranslations("store.HorizontalFilters");
	const tLib = useTranslations("lib.store.data.label");
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);

	const handleBodyPartClick = useCallback(
		(bodyPart: BodyPart) => {
			const joint = bodyPart.joint;
			if (selected.includes(joint)) {
				onChange(selected.filter((j) => j !== joint));
			} else {
				onChange([...selected, joint]);
			}
			setIsOpen(false);
		},
		[selected, onChange]
	);

	const isJointSelected = useCallback(
		(joint: Joint) => selected.includes(joint),
		[selected]
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className={buttonClassName}>
					{selected.length > 0
						? `${t("text.body_part")} (${selected.length})`
						: t("text.body_part")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[40vw] w-full h-[75vh] max-h-[75vh] flex flex-col p-0">
				<DialogHeader className="px-6 pt-6 pb-2">
					<DialogTitle>{t("text.body_part")}</DialogTitle>
				</DialogHeader>

				<div className="flex-1 flex items-center justify-center overflow-hidden p-4">
					{/*
					 * Container uses 3:4 portrait ratio.
					 * The runner image is landscape so object-contain letterboxes it
					 * (image occupies y:30%–70% of this container).
					 * All dot coordinates are calibrated for this full container space.
					 */}
					<div
						className="relative"
						style={{
							aspectRatio: "3 / 4",
							height: "min(calc(75vh - 100px), 100%)",
							maxWidth: "100%",
						}}
					>
						<Image
							src="/images/axb_runner.png"
							alt="Interactive body map"
							fill
							className="object-contain"
							priority
							sizes="(max-width: 768px) 100vw, 600px"
						/>

						<div className="absolute inset-0" role="group" aria-label="Interactive body map">
							{bodyPartsForFilter.map((bodyPart, index) => {
								const isSelected = isJointSelected(bodyPart.joint);
								const isHovered = hoveredPartId === bodyPart.id;
								const isDimmed = hoveredPartId !== null && hoveredPartId !== bodyPart.id;

								return (
									<TooltipProvider key={bodyPart.id} delayDuration={75}>
										<Tooltip>
											<TooltipTrigger asChild>
												<motion.button
													initial={{ opacity: 0, scale: 0 }}
													animate={{
														opacity: isDimmed ? 0.5 : 1,
														scale: isSelected ? 1.4 : isHovered ? 1.2 : 1,
													}}
													whileHover={{ scale: isSelected ? 1.5 : 1.3 }}
													whileTap={{ scale: 0.9 }}
													transition={{ duration: 0.2, delay: index * 0.04 }}
													onClick={() => handleBodyPartClick(bodyPart)}
													onMouseEnter={() => setHoveredPartId(bodyPart.id)}
													onMouseLeave={() => setHoveredPartId(null)}
													className="absolute cursor-pointer focus:outline-none rounded-full z-10"
													style={{
														left: `${bodyPart.coordinates.x}%`,
														top: `${bodyPart.coordinates.y}%`,
														transform: "translate(-50%, -50%)",
													}}
													aria-label={tLib(bodyPart.joint)}
												>
													{/* Pulsing ring */}
													<motion.div
														className={`absolute inset-0 rounded-full ${isSelected ? "bg-orange-500/40" : "bg-orange-400/30"
															}`}
														animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
														transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
													/>

													{/* Main dot */}
													<div
														className={`relative rounded-full w-3 h-3 md:w-4 md:h-4 transition-all duration-200 ${isSelected
															? "bg-orange-600 ring-2 ring-white shadow-lg shadow-orange-500/50"
															: isHovered
																? "bg-yellow-500 ring-2 ring-white shadow-md"
																: "bg-orange-500 ring-1 ring-white/60"
															}`}
													/>
												</motion.button>
											</TooltipTrigger>
											<TooltipContent
												side="top"
												className="bg-gray-900 text-white px-3 py-1.5 text-sm font-medium"
											>
												{tLib(bodyPart.joint)}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								);
							})}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
