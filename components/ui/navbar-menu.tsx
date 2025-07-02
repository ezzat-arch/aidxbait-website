"use client";
import React from "react";
import { motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

const transition: Transition = {
	type: "spring",
	mass: 0.3,
	damping: 25,
	stiffness: 300,
};

export const MenuItem = ({
	setActive,
	active,
	item,
	itemKey,
	children,
}: {
	setActive: (item: string) => void;
	active: string | null;
	item: React.ReactNode;
	itemKey: string;
	children?: React.ReactNode;
}) => {
	return (
		<div onMouseEnter={() => setActive(itemKey)} className="relative">
			<motion.p
				transition={{ duration: 0.15 }}
				className="cursor-pointer text-black dark:text-white"
			>
				{item}
			</motion.p>
			{active !== null && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 8 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.2, ease: "easeOut" }}
				>
					{active === itemKey && (
						<div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
							<motion.div
								transition={{ duration: 0.15, ease: "easeOut" }}
								layoutId="active"
								className="backdrop-blur-sm rounded-2xl overflow-hidden"
							>
								<motion.div layout className="w-max h-full">
									{children}
								</motion.div>
							</motion.div>
						</div>
					)}
				</motion.div>
			)}
		</div>
	);
};

export const Menu = ({
	setActive,
	children,
	logo,
	isScrolled,
}: {
	setActive: (item: string | null) => void;
	children: React.ReactNode;
	logo?: React.ReactNode;
	isScrolled?: boolean;
}) => {
	return (
		<nav
			onMouseLeave={() => setActive(null)}
			className={cn(
				"border border-transparent shadow-input flex items-center transition-all duration-200 z-50",
				isScrolled
					? "fixed top-0 left-0 w-full rounded-none backdrop-blur-md bg-white/90 dark:bg-slate-900/90 px-96 py-2 justify-between shadow-2xl drop-shadow-lg"
					: "relative rounded-full bg-white/95 dark:bg-black/95 dark:border-white/[0.2] backdrop-blur-sm px-8 py-4 sm:py-2 mx-auto mt-4 max-w-4xl justify-between shadow-2xl drop-shadow-lg"
			)}
		>
			{logo && <div className="flex-shrink-0">{logo}</div>}
			<div className="flex justify-end space-x-4 w-full">{children}</div>
		</nav>
	);
};

export const ProductItem = ({
	title,
	description,
	href,
	src,
}: {
	title: string;
	description: string;
	href: string;
	src: string;
}) => {
	return (
		<a href={href} className="flex space-x-2">
			<img
				src={src}
				width={140}
				height={70}
				alt={title}
				className="shrink-0 rounded-md shadow-2xl"
			/>
			<div>
				<h4 className="text-xl font-bold mb-1 text-black dark:text-white">
					{title}
				</h4>
				<p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
					{description}
				</p>
			</div>
		</a>
	);
};

export const HoveredLink = ({ children, ...rest }: any) => {
	return (
		<a
			{...rest}
			className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 font-medium"
		>
			{children}
		</a>
	);
};
