"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 w-full", className)}
		>
			{children}
		</div>
	);
}

export function BentoGridItem({
	title,
	description,
	header,
	icon,
	className,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	header?: React.ReactNode;
	icon?: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm transition-all hover:shadow-lg min-h-[16rem] relative overflow-hidden",
				className
			)}
		>
			{header && <div className="mb-4">{header}</div>}
			<div className="flex items-center gap-2 mb-2">
				{icon && <span>{icon}</span>}
				<h3 className="text-lg font-bold text-neutral-900 dark:text-white">
					{title}
				</h3>
			</div>
			{description && (
				<div className="text-neutral-700 dark:text-neutral-300 text-base">
					{description}
				</div>
			)}
		</div>
	);
}
