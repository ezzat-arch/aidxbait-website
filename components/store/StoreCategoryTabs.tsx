"use client";

import { motion } from "framer-motion";
import { STORE_CATEGORY_CONFIGS } from "@/lib/store-categories";

interface StoreCategoryTabsProps {
	selectedCategoryId: number | null;
	onCategoryChange: (categoryId: number | null) => void;
	className?: string;
}

export function StoreCategoryTabs({
	selectedCategoryId,
	onCategoryChange,
	className = "",
}: StoreCategoryTabsProps) {
	return (
		<div className={`w-full ${className}`}>
			{/* Desktop/Tablet Tabs */}
			<div className="hidden sm:flex items-center justify-center gap-3 flex-wrap">
				{STORE_CATEGORY_CONFIGS.map((category) => {
					const isActive = selectedCategoryId === category.id;
					
					return (
						<button
							key={category.slug}
							onClick={() => onCategoryChange(category.id)}
							className={`
								relative px-6 py-3 rounded-full text-sm font-medium
								transition-all duration-300 ease-out
								${
									isActive
										? "text-white"
										: "text-white/80 hover:text-white hover:bg-white/10"
								}
							`}
							aria-current={isActive ? "page" : undefined}
						>
							{isActive && (
								<motion.div
									layoutId="activeTab"
									className="absolute inset-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
									initial={false}
									transition={{
										type: "spring",
										stiffness: 500,
										damping: 30,
									}}
								/>
							)}
							<span className="relative z-10">{category.name}</span>
						</button>
					);
				})}
			</div>

			{/* Mobile Horizontal Scroll Tabs */}
			<div className="sm:hidden">
				<div className="overflow-x-auto scrollbar-hide">
					<div className="flex items-center gap-2 min-w-max px-4">
						{STORE_CATEGORY_CONFIGS.map((category) => {
							const isActive = selectedCategoryId === category.id;
							
							return (
								<button
									key={category.slug}
									onClick={() => onCategoryChange(category.id)}
									className={`
										relative px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap
										transition-all duration-300 ease-out
										${
											isActive
												? "text-white"
												: "text-white/80 hover:text-white hover:bg-white/10"
										}
									`}
									aria-current={isActive ? "page" : undefined}
								>
									{isActive && (
										<motion.div
											layoutId="activeTabMobile"
											className="absolute inset-0 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
											initial={false}
											transition={{
												type: "spring",
												stiffness: 500,
												damping: 30,
											}}
										/>
									)}
									<span className="relative z-10">{category.name}</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

