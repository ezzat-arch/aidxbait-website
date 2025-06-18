"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
	IconBoxAlignRightFilled,
	IconClipboardCopy,
	IconFileBroken,
	IconSignature,
	IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "motion/react";

const SkeletonOne = () => {
	const variants = {
		initial: { x: 0 },
		animate: { x: 10, rotate: 5, transition: { duration: 0.2 } },
	};
	const variantsSecond = {
		initial: { x: 0 },
		animate: { x: -10, rotate: -5, transition: { duration: 0.2 } },
	};
	return (
		<motion.div
			initial="initial"
			whileHover="animate"
			className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
		>
			<motion.div
				variants={variants}
				className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black"
			>
				<div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
				<div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
			</motion.div>
			<motion.div
				variants={variantsSecond}
				className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
			>
				<div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
				<div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
			</motion.div>
			<motion.div
				variants={variants}
				className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-black"
			>
				<div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
				<div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
			</motion.div>
		</motion.div>
	);
};
const SkeletonTwo = () => {
	const variants = {
		initial: { width: 0 },
		animate: { width: "100%", transition: { duration: 0.2 } },
		hover: { width: ["0%", "100%"], transition: { duration: 2 } },
	};
	const arr = new Array(6).fill(0);
	return (
		<motion.div
			initial="initial"
			animate="animate"
			whileHover="hover"
			className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
		>
			{arr.map((_, i) => (
				<motion.div
					key={"skelenton-two" + i}
					variants={variants}
					style={{ maxWidth: Math.random() * (100 - 40) + 40 + "%" }}
					className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-neutral-100 dark:bg-black w-full h-4"
				></motion.div>
			))}
		</motion.div>
	);
};
const SkeletonThree = () => {
	const variants = {
		initial: { backgroundPosition: "0 50%" },
		animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] },
	};
	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={variants}
			transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
			className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2"
			style={{
				background:
					"linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
				backgroundSize: "400% 400%",
			}}
		>
			<motion.div className="h-full w-full rounded-lg"></motion.div>
		</motion.div>
	);
};
const SkeletonFour = () => {
	const first = {
		initial: { x: 20, rotate: -5 },
		hover: { x: 0, rotate: 0 },
	};
	const second = {
		initial: { x: -20, rotate: 5 },
		hover: { x: 0, rotate: 0 },
	};
	return (
		<motion.div
			initial="initial"
			animate="animate"
			whileHover="hover"
			className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
		>
			<motion.div
				variants={first}
				className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
			>
				<img
					src="/images/services1.png"
					alt="PT Home Visits"
					height="100"
					width="100"
					className="rounded-full h-10 w-10 object-cover"
				/>
				<p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
					Professional PT at your home
				</p>
				<p className="border border-blue-500 bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs rounded-full px-2 py-0.5 mt-4">
					Convenient
				</p>
			</motion.div>
			<motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
				<img
					src="/images/services2.png"
					alt="Exercise Programs"
					height="100"
					width="100"
					className="rounded-full h-10 w-10 object-cover"
				/>
				<p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
					Personalized exercise routines
				</p>
				<p className="border border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs rounded-full px-2 py-0.5 mt-4">
					Effective
				</p>
			</motion.div>
			<motion.div
				variants={second}
				className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
			>
				<img
					src="/images/services4.png"
					alt="Online Consultations"
					height="100"
					width="100"
					className="rounded-full h-10 w-10 object-cover"
				/>
				<p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
					Expert consultations online
				</p>
				<p className="border border-purple-500 bg-purple-100 dark:bg-purple-900/20 text-purple-600 text-xs rounded-full px-2 py-0.5 mt-4">
					Accessible
				</p>
			</motion.div>
		</motion.div>
	);
};
const SkeletonFive = () => {
	const variants = {
		initial: { x: 0 },
		animate: { x: 10, rotate: 5, transition: { duration: 0.2 } },
	};
	const variantsSecond = {
		initial: { x: 0 },
		animate: { x: -10, rotate: -5, transition: { duration: 0.2 } },
	};
	return (
		<motion.div
			initial="initial"
			whileHover="animate"
			className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
		>
			<motion.div
				variants={variants}
				className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-start space-x-2 bg-white dark:bg-black"
			>
				<img
					src="/images/logo-icon.png"
					alt="AidXBait"
					height="100"
					width="100"
					className="rounded-full h-10 w-10 object-cover"
				/>
				<p className="text-xs text-neutral-500">
					AidXBait offers comprehensive physiotherapy services including home
					visits, exercise programs, and online consultations to help you
					recover faster...
				</p>
			</motion.div>
			<motion.div
				variants={variantsSecond}
				className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
			>
				<p className="text-xs text-neutral-500">Start your recovery today!</p>
				<div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 shrink-0" />
			</motion.div>
		</motion.div>
	);
};
const items = [
	{
		title: "Patients Helped",
		description: (
			<span className="text-sm">
				Over 10,000 patients have used AidXBait for their recovery.
			</span>
		),
		header: <SkeletonOne />,
		className: "md:col-span-1",
		icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Therapists Onboard",
		description: (
			<span className="text-sm">
				500+ certified therapists available for home visits and consultations.
			</span>
		),
		header: <SkeletonTwo />,
		className: "md:col-span-1",
		icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Faster Recovery",
		description: (
			<span className="text-sm">
				Patients report 30% faster recovery with our programs.
			</span>
		),
		header: <SkeletonThree />,
		className: "md:col-span-1",
		icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "App Downloads",
		description: (
			<span className="text-sm">5,000+ downloads of our mobile app.</span>
		),
		header: <SkeletonFour />,
		className: "md:col-span-2",
		icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Consultations Booked",
		description: (
			<span className="text-sm">
				8,000+ online and in-person consultations booked.
			</span>
		),
		header: <SkeletonFive />,
		className: "md:col-span-1",
		icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
	},
];

export default function BentoGridThirdDemo() {
	return (
		<BentoGrid className="max-w-6xl mx-auto md:auto-rows-[20rem]">
			{items.map((item, i) => (
				<BentoGridItem
					key={i}
					title={item.title}
					description={item.description}
					header={item.header}
					className={cn("[&>p:text-lg]", item.className)}
					icon={item.icon}
				/>
			))}
		</BentoGrid>
	);
}
