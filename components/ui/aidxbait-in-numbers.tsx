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
import { motion } from "framer-motion";

const SkeletonOne = () => {
	const variants = {
		initial: { scale: 1 },
		animate: { scale: 1.05, transition: { duration: 0.3 } },
	};
	return (
		<motion.div
			initial="initial"
			whileHover="animate"
			className="flex flex-1 w-full h-full min-h-[6rem] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex-col justify-center items-center space-y-3 rounded-lg p-4"
		>
			<motion.div variants={variants} className="text-center">
				<div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
					10,000+
				</div>
				<div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
					Patients Helped
				</div>
			</motion.div>
			<div className="flex space-x-1 mt-2">
				{[...Array(5)].map((_, i) => (
					<motion.div
						key={i}
						className="w-2 h-2 bg-blue-400 rounded-full"
						animate={{ scale: [1, 1.3, 1] }}
						transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
					/>
				))}
			</div>
			<div className="text-center mt-3 space-y-1">
				<div className="text-xs text-blue-700 dark:text-blue-300">
					Over 10,000 patients have used AidXBait for their recovery.
				</div>
				<div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
					Avg. Age: 42 years
				</div>
				<div className="text-xs text-blue-500 dark:text-blue-300 italic">
					Fun fact: Our youngest patient was just 3 years old!
				</div>
			</div>
		</motion.div>
	);
};
const SkeletonTwo = () => {
	const specialties = [
		{ name: "Physical Therapy", count: 185, percentage: 37 },
		{ name: "Lab Services", count: 95, percentage: 19 },
		{ name: "Imaging", count: 120, percentage: 24 },
		{ name: "Nursing", count: 80, percentage: 16 },
		{ name: "Consultations", count: 20, percentage: 4 },
	];

	return (
		<motion.div className="flex flex-1 w-full h-full min-h-[6rem] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 flex-col justify-center p-4 rounded-lg">
			<div className="text-center mb-4">
				<div className="text-2xl font-bold text-green-600 dark:text-green-400">
					500+
				</div>
				<div className="text-sm text-green-700 dark:text-green-300">
					Licensed Professionals
				</div>
			</div>
			<div className="space-y-3">
				{specialties.map((specialty, i) => (
					<div key={i} className="flex items-center justify-between">
						<div className="flex items-center space-x-3 flex-1">
							<motion.div
								className="w-3 h-3 rounded-full bg-green-500"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.3, delay: i * 0.1 }}
							/>
							<span className="text-xs font-medium text-green-700 dark:text-green-300">
								{specialty.name}
							</span>
						</div>
						<motion.span
							className="text-xs font-semibold text-green-600 dark:text-green-400"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
						>
							{specialty.count}
						</motion.span>
					</div>
				))}
			</div>
		</motion.div>
	);
};
const SkeletonThree = () => {
	const recoveryData = [
		{ week: "Week 1", before: 20, after: 35 },
		{ week: "Week 2", before: 30, after: 50 },
		{ week: "Week 3", before: 40, after: 70 },
		{ week: "Week 4", before: 50, after: 85 },
	];

	return (
		<motion.div className="flex flex-1 w-full h-full min-h-[6rem] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 flex-col justify-center p-4 rounded-lg">
			<div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2 text-center">
				30% Faster Recovery
			</div>
			<div className="flex justify-between items-end h-16 mb-2">
				{recoveryData.map((data, i) => (
					<div key={i} className="flex flex-col items-center space-y-1">
						<div className="flex space-x-1">
							<motion.div
								className="w-2 bg-purple-300 rounded-t"
								style={{ height: `${data.before * 0.6}px` }}
								initial={{ height: 0 }}
								animate={{ height: `${data.before * 0.6}px` }}
								transition={{ duration: 0.8, delay: i * 0.1 }}
							/>
							<motion.div
								className="w-2 bg-purple-600 rounded-t"
								style={{ height: `${data.after * 0.6}px` }}
								initial={{ height: 0 }}
								animate={{ height: `${data.after * 0.6}px` }}
								transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
							/>
						</div>
						<span className="text-xs text-purple-700 dark:text-purple-300">
							{data.week}
						</span>
					</div>
				))}
			</div>
			<div className="flex justify-center space-x-3 text-xs mb-3">
				<div className="flex items-center space-x-1">
					<div className="w-2 h-2 bg-purple-300 rounded"></div>
					<span className="text-purple-700 dark:text-purple-300">Before</span>
				</div>
				<div className="flex items-center space-x-1">
					<div className="w-2 h-2 bg-purple-600 rounded"></div>
					<span className="text-purple-700 dark:text-purple-300">
						With AidXBait
					</span>
				</div>
			</div>
			<div className="text-center space-y-1">
				<div className="text-xs text-purple-700 dark:text-purple-300">
					📈 Faster Recovery
				</div>
				<div className="text-xs text-purple-600 dark:text-purple-400">
					Patients report 30% faster recovery with our programs.
				</div>
				<div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
					Avg. Program Length: 6 weeks
				</div>
				<div className="text-xs text-purple-500 dark:text-purple-300 italic">
					Fun fact: Our fastest recovery was just 2 weeks!
				</div>
			</div>
		</motion.div>
	);
};
const SkeletonFour = () => {
	const downloadStats = [
		{ platform: "iOS", downloads: 2800, color: "bg-blue-500" },
		{ platform: "Android", downloads: 2200, color: "bg-green-500" },
	];
	const totalDownloads = downloadStats.reduce(
		(sum, stat) => sum + stat.downloads,
		0
	);

	return (
		<motion.div className="flex flex-1 w-full h-full min-h-[6rem] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 flex-col justify-center p-4 rounded-lg">
			<div className="text-xl font-bold text-teal-600 dark:text-teal-400 mb-3 text-center">
				5,000+ App Downloads
			</div>

			<div className="flex justify-center space-x-6 mb-3">
				{downloadStats.map((stat, i) => (
					<div key={i} className="text-center">
						<motion.div
							className={`w-14 h-14 ${stat.color} rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-1`}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5, delay: i * 0.2 }}
						>
							{Math.round((stat.downloads / totalDownloads) * 100)}%
						</motion.div>
						<div className="text-xs font-medium text-teal-700 dark:text-teal-300">
							{stat.platform}
						</div>
						<div className="text-xs text-teal-600 dark:text-teal-400">
							{stat.downloads.toLocaleString()}
						</div>
					</div>
				))}
			</div>

			<div className="text-center space-y-1">
				<div className="text-sm font-medium text-teal-700 dark:text-teal-300">
					⭐ 4.8/5 Rating
				</div>
				<div className="text-xs text-teal-600 dark:text-teal-400">
					85% daily active users
				</div>
				<div className="text-xs text-teal-600 dark:text-teal-400">
					Available on iOS and Android stores.
				</div>
				<div className="text-xs text-teal-500 dark:text-teal-300 italic">
					Most users check progress daily!
				</div>
			</div>
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
			className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-1 p-2"
		>
			<motion.div
				variants={variants}
				className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2 items-start space-x-2 bg-white dark:bg-black"
			>
				<img
					src="/images/logo-icon.png"
					alt="AidXBait"
					height="100"
					width="100"
					className="rounded-full h-8 w-8 object-cover"
				/>
				<div className="flex-1">
					<p className="text-xs text-neutral-500 mb-1 leading-tight">
						AidXBait offers comprehensive physiotherapy services including home
						visits, exercise programs, and online consultations to help you
						recover faster...
					</p>
					<p className="text-xs text-neutral-400 font-medium">
						Available 24/7 for emergency consultations
					</p>
				</div>
			</motion.div>
			<motion.div
				variants={variantsSecond}
				className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-1 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
			>
				<p className="text-xs text-neutral-500">Start your recovery today!</p>
				<div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-green-500 shrink-0" />
			</motion.div>
			<div className="mt-1 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
				<p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
					📊 Consultation Stats:
				</p>
				<div className="space-y-0.5">
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Home Visits:</span>
						<span className="text-neutral-700 dark:text-neutral-300 font-medium">
							3,200+
						</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Online Sessions:</span>
						<span className="text-neutral-700 dark:text-neutral-300 font-medium">
							4,800+
						</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Avg. Session Time:</span>
						<span className="text-neutral-700 dark:text-neutral-300 font-medium">
							45 min
						</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Patient Satisfaction:</span>
						<span className="text-neutral-700 dark:text-neutral-300 font-medium">
							98%
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
const items = [
	{
		title: "Patients Helped",
		description: (
			<div>
				<span className="text-sm block">
					Over 10,000 patients have used AidXBait for their recovery.
				</span>
				<span className="text-xs text-neutral-500 block mt-1">
					<b>Avg. Age:</b> 42 years
				</span>
				<span className="text-[11px] text-blue-600 dark:text-blue-300 mt-1 block italic">
					Fun fact: Our youngest patient was just 3 years old!
				</span>
			</div>
		),
		header: <SkeletonOne />,
		className: "md:col-span-1",
		icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Therapists Onboard",
		description: (
			<div>
				<span className="text-sm block">
					500+ certified therapists available for home visits and consultations.
				</span>
				<span className="text-xs text-neutral-500 block mt-1">
					<b>Top Specialty:</b> Orthopedic Rehab
				</span>
				<span className="text-[11px] text-green-600 dark:text-green-300 mt-1 block italic">
					Fun fact: 60% of our therapists speak two or more languages!
				</span>
			</div>
		),
		header: <SkeletonTwo />,
		className: "md:col-span-1",
		icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Faster Recovery",
		description: (
			<div>
				<span className="text-sm block">
					Patients report 30% faster recovery with our programs.
				</span>
				<span className="text-xs text-neutral-500 block mt-1">
					<b>Avg. Program Length:</b> 6 weeks
				</span>
				<span className="text-[11px] text-purple-600 dark:text-purple-300 mt-1 block italic">
					Fun fact: Our fastest recovery was just 2 weeks!
				</span>
			</div>
		),
		header: <SkeletonThree />,
		className: "md:col-span-1",
		icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "App Downloads",
		description: (
			<div>
				<span className="text-sm block">
					5,000+ downloads of our mobile app across iOS and Android.
				</span>
				<span className="text-xs text-neutral-500 block mt-1">
					<b>Average Rating:</b> 4.8/5 stars
				</span>
				<span className="text-[11px] text-orange-600 dark:text-orange-300 mt-1 block italic">
					Fun fact: 85% of users open the app daily!
				</span>
			</div>
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

const AidxbaitInNumbers = () => {
	return (
		<section className="py-20 bg-gray-50">
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.6 }}
			>
				<motion.h2
					className="text-3xl md:text-4xl font-bold text-center mb-10"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					AidXBait in Numbers
				</motion.h2>
				<BentoGrid className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[26rem]">
					{items.map((item, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 50, scale: 0.9 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{
								duration: 0.5,
								delay: i * 0.1,
								type: "spring",
								stiffness: 100,
							}}
							whileHover={{
								scale: 1.02,
								y: -5,
								transition: { duration: 0.2 },
							}}
							className={cn("h-full", item.className)}
						>
							<BentoGridItem
								title={item.title}
								description={item.description}
								header={item.header}
								className="[&>p:text-lg] h-full"
								icon={item.icon}
							/>
						</motion.div>
					))}
				</BentoGrid>
			</motion.div>
		</section>
	);
};

export default AidxbaitInNumbers;
