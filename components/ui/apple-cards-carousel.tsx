"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Card {
	category: string;
	title: string;
	src: string;
	content: React.ReactNode;
}

export const Carousel = ({ items }: { items: React.ReactNode[] }) => {
	const t = useTranslations("ui.apple.attr.aria-label");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);

	// Auto-scroll functionality
	useEffect(() => {
		if (isHovered) return; // Pause auto-scroll when hovering

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex >= items.length - 1 ? 0 : prevIndex + 1
			);
		}, 4000); // Change slide every 4 seconds

		return () => clearInterval(interval);
	}, [items.length, isHovered]);

	// Scroll to current index
	useEffect(() => {
		if (carouselRef.current) {
			const cardWidth = 384; // w-96 = 384px
			const gap = 16; // gap-4 = 16px
			const scrollPosition = (cardWidth + gap) * currentIndex;

			carouselRef.current.scrollTo({
				left: scrollPosition,
				behavior: "smooth",
			});
		}
	}, [currentIndex]);

	const goToPrevious = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex <= 0 ? items.length - 1 : prevIndex - 1
		);
	};

	const goToNext = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex >= items.length - 1 ? 0 : prevIndex + 1
		);
	};

	return (
		<div
			className="relative w-full"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Left Arrow */}
			<button
				onClick={goToPrevious}
				className="absolute -left-16 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 dark:bg-black/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-black transition-all duration-200 hover:scale-110"
				aria-label={t("previous_slide")}
			>
				<ChevronLeft className="w-6 h-6 text-blue-600 dark:text-gray-200" />
			</button>

			{/* Right Arrow */}
			<button
				onClick={goToNext}
				className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-30 bg-white/90 dark:bg-black/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-black transition-all duration-200 hover:scale-110"
				aria-label={t("next_slide")}
			>
				<ChevronRight className="w-6 h-6 text-blue-600 dark:text-gray-200" />
			</button>

			{/* Carousel */}
			<div
				ref={carouselRef}
				className="flex gap-4 py-10 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
				style={{ scrollSnapType: "x mandatory" }}
			>
				{items.map((item, index) => (
					<motion.div
						key={index}
						className="flex-shrink-0 snap-center"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						style={{ scrollSnapAlign: "center" }}
					>
						{item}
					</motion.div>
				))}
			</div>

			{/* Dots Indicator */}
			<div className="flex justify-center mt-6 space-x-2">
				{items.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentIndex(index)}
						className={cn(
							"w-2 h-2 rounded-full transition-all duration-300",
							index === currentIndex
								? "bg-primary w-8"
								: "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
						)}
						aria-label={t("go_to_slide", { number: index + 1 })}
					/>
				))}
			</div>
		</div>
	);
};

export const Card = ({ card, index }: { card: Card; index: number }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);

	return (
		<>
			<motion.div
				className={cn(
					"rounded-3xl bg-gray-100 dark:bg-neutral-800 h-80 w-56 md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 cursor-pointer",
					isHovered && "shadow-2xl"
				)}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={() => setIsOpen(true)}
				layout
				whileHover={{ scale: 1.02 }}
				transition={{ duration: 0.2 }}
			>
				<div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
				<div className="relative z-40 p-8">
					<motion.p
						className="text-white text-sm md:text-base font-medium font-sans text-left"
						layout
					>
						{card.category}
					</motion.p>
					<motion.p
						className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2"
						layout
					>
						{card.title}
					</motion.p>
				</div>
				<BlurImage
					src={card.src}
					alt={card.title}
					className="object-cover absolute z-10 inset-0 w-full h-full"
				/>
			</motion.div>

			{/* Expanded Modal */}
			{isOpen && (
				<motion.div
					className="fixed inset-0 h-screen z-50 overflow-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
						onClick={() => setIsOpen(false)}
					/>
					<motion.div
						className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
					>
						<button
							className="sticky top-4 h-8 w-8 right-0 ml-auto bg-black dark:bg-white rounded-full flex items-center justify-center"
							onClick={() => setIsOpen(false)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-4 w-4 text-white dark:text-black"
							>
								<path d="m18 6-12 12" />
								<path d="m6 6 12 12" />
							</svg>
						</button>
						<motion.p
							className="text-base font-medium text-black dark:text-white"
							layout
						>
							{card.category}
						</motion.p>
						<motion.p
							className="text-2xl md:text-5xl font-semibold text-neutral-700 dark:text-white mt-4"
							layout
						>
							{card.title}
						</motion.p>
						<div className="py-10">{card.content}</div>
					</motion.div>
				</motion.div>
			)}
		</>
	);
};

export const BlurImage = ({
	src,
	className,
	alt,
	...rest
}: {
	src: string;
	className?: string;
	alt?: string;
	width?: number;
	height?: number;
	[key: string]: any;
}) => {
	const [isLoading, setLoading] = useState(true);
	const t = useTranslations("ui.apple.attr.alt");
	return (
		<img
			className={cn(
				"transition duration-300",
				isLoading ? "blur-sm" : "blur-0",
				className
			)}
			onLoad={() => setLoading(false)}
			src={src}
			alt={alt || t("background_fallback")}
			{...rest}
		/>
	);
};
