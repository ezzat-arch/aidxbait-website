"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import {
	IconUser,
	IconHeart,
	IconShoppingBag,
	IconDeviceMobile,
	IconCalendar,
	IconClock,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export function StatisticsSection() {
	const stats = [
		{
			title: "Patients Helped",
			description: (
				<span className="text-sm">
					Over 10,000 patients have used AidXBait for their recovery.
				</span>
			),
			header: <StatSkeletonOne />,
			className: "md:col-span-1",
			icon: <IconUser className="h-4 w-4 text-neutral-500" />,
			img: "https://randomuser.me/api/portraits/men/32.jpg",
		},
		{
			title: "Therapists Onboard",
			description: (
				<span className="text-sm">
					500+ certified therapists available for home visits and consultations.
				</span>
			),
			header: <StatSkeletonTwo />,
			className: "md:col-span-1",
			icon: <IconHeart className="h-4 w-4 text-neutral-500" />,
			img: "https://randomuser.me/api/portraits/women/44.jpg",
		},
		{
			title: "Products Delivered",
			description: (
				<span className="text-sm">
					2,000+ rehab products delivered to doorsteps.
				</span>
			),
			header: <StatSkeletonThree />,
			className: "md:col-span-1",
			icon: <IconShoppingBag className="h-4 w-4 text-neutral-500" />,
			img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=80&h=80&q=80",
		},
		{
			title: "App Downloads",
			description: (
				<span className="text-sm">5,000+ downloads of our mobile app.</span>
			),
			header: <StatSkeletonFour />,
			className: "md:col-span-2",
			icon: <IconDeviceMobile className="h-4 w-4 text-neutral-500" />,
			img: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=80&h=80&q=80",
		},
		{
			title: "Consultations Booked",
			description: (
				<span className="text-sm">
					8,000+ online and in-person consultations booked.
				</span>
			),
			header: <StatSkeletonFive />,
			className: "md:col-span-1",
			icon: <IconCalendar className="h-4 w-4 text-neutral-500" />,
			img: "https://randomuser.me/api/portraits/men/65.jpg",
		},
		{
			title: "Faster Recovery",
			description: (
				<span className="text-sm">
					Patients report 30% faster recovery with our programs.
				</span>
			),
			header: <StatSkeletonOne />,
			className: "md:col-span-1",
			icon: <IconClock className="h-4 w-4 text-neutral-500" />,
			img: "https://randomuser.me/api/portraits/women/68.jpg",
		},
	];

	return (
		<section id="statistics" className="py-20 bg-white dark:bg-black">
			<h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
				AidXBait in Numbers
			</h2>
			<BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
				{stats.map((item, i) => (
					<motion.div
						key={i}
						whileHover={{
							scale: 1.04,
							boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
						}}
						whileTap={{ scale: 0.98 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
						className="h-full"
					>
						<BentoGridItem
							title={item.title}
							description={item.description}
							header={
								<div className="flex items-center gap-3">
									<img
										src={item.img}
										alt={item.title}
										className="rounded-full h-12 w-12 object-cover border border-neutral-200 dark:border-neutral-700 shadow"
									/>
									{item.header}
								</div>
							}
							className={cn("[&>p:text-lg] h-full", item.className)}
							icon={item.icon}
						/>
					</motion.div>
				))}
			</BentoGrid>
		</section>
	);
}

const StatSkeletonOne = () => (
	<div className="h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg" />
);
const StatSkeletonTwo = () => (
	<div className="h-16 bg-green-100 dark:bg-green-900/30 rounded-lg" />
);
const StatSkeletonThree = () => (
	<div className="h-16 bg-pink-100 dark:bg-pink-900/30 rounded-lg" />
);
const StatSkeletonFour = () => (
	<div className="h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg" />
);
const StatSkeletonFive = () => (
	<div className="h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg" />
);
