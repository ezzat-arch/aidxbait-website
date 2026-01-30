"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
	IconBoxAlignRightFilled,
	IconClipboardCopy,
	IconFileBroken,
	IconSignature,
	IconTableColumn,
} from "@tabler/icons-react";

const cardAnimation = {
	initial: { opacity: 0, y: 50, scale: 0.9 },
	animate: { opacity: 1, y: 0, scale: 1 },
};

const PatientsHelpedCard = () => {
	const variants = {
		initial: { scale: 1 },
		animate: { scale: 1.05, transition: { duration: 0.3 } },
	};

	return (
		<motion.div
			initial="initial"
			whileHover="animate"
			className="flex h-full min-h-[6rem] w-full flex-1 flex-col items-center justify-center space-y-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center dark:from-blue-900/20 dark:to-blue-800/20"
		>
			<motion.div variants={variants}>
				<div className="mb-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
					10,000+
				</div>
				<div className="text-sm font-medium text-blue-800 dark:text-blue-300">
					Patients Helped
				</div>
			</motion.div>
			<div className="mt-2 flex space-x-1">
				{[...Array(5)].map((_, index) => (
					<motion.div
						key={index}
						className="h-2 w-2 rounded-full bg-blue-400"
						animate={{ scale: [1, 1.3, 1] }}
						transition={{ duration: 1, delay: index * 0.1, repeat: Infinity }}
					/>
				))}
			</div>
			<div className="mt-3 space-y-1 text-xs text-blue-700 dark:text-blue-300">
				<div>Over 10,000 patients have used AidxBait for their recovery.</div>
				<div className="font-medium text-blue-600 dark:text-blue-400">
					Avg. Age: 42 years
				</div>
				<div className="italic text-blue-500 dark:text-blue-300">
					Fun fact: Our youngest patient was just 3 years old!
				</div>
			</div>
		</motion.div>
	);
};

const SpecialistsCard = () => {
	const specialties = [
		{ name: "Physical Therapy", count: 185, percentage: 37 },
		{ name: "Lab Services", count: 95, percentage: 19 },
		{ name: "Imaging", count: 120, percentage: 24 },
		{ name: "Nursing", count: 80, percentage: 16 },
		{ name: "Consultations", count: 20, percentage: 4 },
	];

	return (
		<motion.div className="flex h-full min-h-[6rem] w-full flex-1 flex-col justify-center rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-900/20 dark:to-green-800/20">
			<div className="mb-4 text-center">
				<div className="text-2xl font-bold text-green-600 dark:text-green-400">
					500+
				</div>
				<div className="text-sm text-green-700 dark:text-green-300">
					Licensed Professionals
				</div>
			</div>
			<div className="space-y-3">
				{specialties.map((specialty, index) => (
					<div
						key={specialty.name}
						className="flex items-center justify-between"
					>
						<div className="flex flex-1 items-center space-x-3">
							<motion.div
								className="h-3 w-3 rounded-full bg-green-500"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
							/>
							<span className="text-xs font-medium text-green-700 dark:text-green-300">
								{specialty.name}
							</span>
						</div>
						<motion.span
							className="text-xs font-semibold text-green-600 dark:text-green-400"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
						>
							{specialty.count}
						</motion.span>
					</div>
				))}
			</div>
		</motion.div>
	);
};

const RecoveryCard = () => {
	const recoveryData = [
		{ week: "Week 1", before: 20, after: 35 },
		{ week: "Week 2", before: 30, after: 50 },
		{ week: "Week 3", before: 40, after: 70 },
		{ week: "Week 4", before: 50, after: 85 },
	];

	return (
		<motion.div className="flex h-full min-h-[6rem] w-full flex-1 flex-col justify-center rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20">
			<div className="mb-2 text-center text-lg font-bold text-purple-600 dark:text-purple-400">
				30% Faster Recovery
			</div>
			<div className="mb-2 flex h-16 justify-between">
				{recoveryData.map((data, index) => (
					<div key={data.week} className="flex flex-col items-center space-y-1">
						<div className="flex space-x-1">
							<motion.div
								className="w-2 rounded-t bg-purple-300"
								style={{ height: `${data.before * 0.6}px` }}
								initial={{ height: 0 }}
								animate={{ height: `${data.before * 0.6}px` }}
								transition={{ duration: 0.8, delay: index * 0.1 }}
							/>
							<motion.div
								className="w-2 rounded-t bg-purple-600"
								style={{ height: `${data.after * 0.6}px` }}
								initial={{ height: 0 }}
								animate={{ height: `${data.after * 0.6}px` }}
								transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
							/>
						</div>
						<span className="text-xs text-purple-700 dark:text-purple-300">
							{data.week}
						</span>
					</div>
				))}
			</div>
			<div className="mb-3 flex justify-center space-x-3 text-xs">
				<div className="flex items-center space-x-1">
					<div className="h-2 w-2 rounded bg-purple-300" />
					<span className="text-purple-700 dark:text-purple-300">Before</span>
				</div>
				<div className="flex items-center space-x-1">
					<div className="h-2 w-2 rounded bg-purple-600" />
					<span className="text-purple-700 dark:text-purple-300">
						With AidxBait
					</span>
				</div>
			</div>
			<div className="space-y-1 text-center text-xs text-purple-700 dark:text-purple-300">
				<div>📈 Faster Recovery</div>
				<div className="text-purple-600 dark:text-purple-400">
					Patients report 30% faster recovery with our programs.
				</div>
				<div className="font-medium text-purple-600 dark:text-purple-400">
					Avg. Program Length: 6 weeks
				</div>
				<div className="italic text-purple-500 dark:text-purple-300">
					Fun fact: Our fastest recovery was just 2 weeks!
				</div>
			</div>
		</motion.div>
	);
};

const AppDownloadsCard = () => {
	const downloadStats = [
		{ platform: "iOS", downloads: 2800, color: "bg-blue-500" },
		{ platform: "Android", downloads: 2200, color: "bg-green-500" },
	];
	const totalDownloads = downloadStats.reduce(
		(sum, stat) => sum + stat.downloads,
		0
	);

	return (
		<motion.div className="flex h-full min-h-[6rem] w-full flex-1 flex-col justify-center rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 p-4 text-center dark:from-teal-900/20 dark:to-teal-800/20">
			<div className="mb-3 text-xl font-bold text-teal-600 dark:text-teal-400">
				5,000+ App Downloads
			</div>
			<div className="mb-3 flex justify-center space-x-6">
				{downloadStats.map((stat, index) => (
					<div key={stat.platform} className="text-center">
						<motion.div
							className={`mx-auto mb-1 flex h-14 w-14 items-center justify-center rounded-full font-bold text-sm text-white ${stat.color}`}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.5, delay: index * 0.2 }}
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
			<div className="space-y-1 text-xs text-teal-600 dark:text-teal-400">
				<div className="font-medium text-teal-700 dark:text-teal-300">
					⭐ 4.8/5 Rating
				</div>
				<div>85% daily active users</div>
				<div>Available on iOS and Android stores.</div>
				<div className="italic text-teal-500 dark:text-teal-300">
					Most users check progress daily!
				</div>
			</div>
		</motion.div>
	);
};

const ConsultationsCard = () => {
	const marqueeVariants = {
		initial: { x: 0 },
		animate: { x: 10, rotate: 5, transition: { duration: 0.2 } },
	};
	const responseVariants = {
		initial: { x: 0 },
		animate: { x: -10, rotate: -5, transition: { duration: 0.2 } },
	};

	return (
		<motion.div
			initial="initial"
			whileHover="animate"
			className="flex h-full min-h-[6rem] w-full flex-1 flex-col space-y-2 bg-dot-black/[0.2] p-2 dark:bg-dot-white/[0.2]"
		>
			<motion.div
				variants={marqueeVariants}
				className="flex flex-row items-start space-x-2 rounded-2xl border border-neutral-100 bg-white p-2 dark:border-white/[0.2] dark:bg-black"
			>
				<img
					src="/images/logo-icon.png"
					alt="AidxBait"
					height={100}
					width={100}
					className="h-8 w-8 rounded-full object-cover"
				/>
				<div className="flex-1">
					<p className="mb-1 text-xs leading-tight text-neutral-500">
						AidxBait offers comprehensive physiotherapy services including home
						visits, exercise programs, and online consultations to help you
						recover faster...
					</p>
					<p className="text-xs font-medium text-neutral-400">
						Available 24/7 for emergency consultations
					</p>
				</div>
			</motion.div>
			<motion.div
				variants={responseVariants}
				className="ml-auto flex w-3/4 flex-row items-center justify-end space-x-2 rounded-full border border-neutral-100 bg-white p-1 dark:border-white/[0.2] dark:bg-black"
			>
				<p className="text-xs text-neutral-500">Start your recovery today!</p>
				<div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
			</motion.div>
			<div className="mt-1 space-y-0.5 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
				<p className="mb-1 text-xs text-neutral-600 dark:text-neutral-400">
					📊 Consultation Stats:
				</p>
				<div className="space-y-0.5">
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Home Visits:</span>
						<span className="font-medium text-neutral-700 dark:text-neutral-300">
							3,200+
						</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Online Sessions:</span>
						<span className="font-medium text-neutral-700 dark:text-neutral-300">
							4,800+
						</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Avg. Session Time:</span>
						<span className="font-medium text-neutral-700 dark:text-neutral-300">
							45 min
						</span>
					</div>
					<div className="flex justify-between text-xs">
						<span className="text-neutral-500">Patient Satisfaction:</span>
						<span className="font-medium text-neutral-700 dark:text-neutral-300">
							98%
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const metrics = [
	{
		title: "Patients Helped",
		description: (
			<div>
				<span className="block text-sm">
					Over 10,000 patients have used AidxBait for their recovery.
				</span>
				<span className="mt-1 block text-xs text-neutral-500">
					<b>Avg. Age:</b> 42 years
				</span>
				<span className="mt-1 block text-[11px] italic text-blue-600 dark:text-blue-300">
					Fun fact: Our youngest patient was just 3 years old!
				</span>
			</div>
		),
		header: <PatientsHelpedCard />,
		className: "md:col-span-1",
		icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Therapists Onboard",
		description: (
			<div>
				<span className="block text-sm">
					500+ certified therapists available for home visits and consultations.
				</span>
				<span className="mt-1 block text-xs text-neutral-500">
					<b>Top Specialty:</b> Orthopedic Rehab
				</span>
				<span className="mt-1 block text-[11px] italic text-green-600 dark:text-green-300">
					Fun fact: 60% of our therapists speak two or more languages!
				</span>
			</div>
		),
		header: <SpecialistsCard />,
		className: "md:col-span-1",
		icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Faster Recovery",
		description: (
			<div>
				<span className="block text-sm">
					Patients report 30% faster recovery with our programs.
				</span>
				<span className="mt-1 block text-xs text-neutral-500">
					<b>Avg. Program Length:</b> 6 weeks
				</span>
				<span className="mt-1 block text-[11px] italic text-purple-600 dark:text-purple-300">
					Fun fact: Our fastest recovery was just 2 weeks!
				</span>
			</div>
		),
		header: <RecoveryCard />,
		className: "md:col-span-1",
		icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "App Downloads",
		description: (
			<div>
				<span className="block text-sm">
					5,000+ downloads of our mobile app across iOS and Android.
				</span>
				<span className="mt-1 block text-xs text-neutral-500">
					<b>Average Rating:</b> 4.8/5 stars
				</span>
				<span className="mt-1 block text-[11px] italic text-orange-600 dark:text-orange-300">
					Fun fact: 85% of users open the app daily!
				</span>
			</div>
		),
		header: <AppDownloadsCard />,
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
		header: <ConsultationsCard />,
		className: "md:col-span-1",
		icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
	},
];

export function AidXbaitMetricsSection() {
	return (
		<section className="bg-gray-50 py-20">
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.6 }}
			>
				<motion.h2
					className="mb-10 text-center text-3xl font-bold md:text-4xl"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					AidxBait in Numbers
				</motion.h2>
				<BentoGrid className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:auto-rows-[26rem] md:grid-cols-3">
					{metrics.map((item, index) => (
						<motion.div
							key={item.title}
							initial={cardAnimation.initial}
							whileInView={cardAnimation.animate}
							viewport={{ once: true, amount: 0.3 }}
							transition={{
								duration: 0.5,
								delay: index * 0.1,
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
								className="h-full [&>p:text-lg]"
								icon={item.icon}
							/>
						</motion.div>
					))}
				</BentoGrid>
			</motion.div>
		</section>
	);
}
