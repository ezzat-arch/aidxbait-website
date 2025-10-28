"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Language {
	code: string;
	label: string;
	flag: React.ReactNode;
}

interface LanguageDropdownProps {
	currentLanguage: string;
	onLanguageChange: (language: string) => void;
	className?: string;
}

// Flag components as SVGs for better quality and performance
const UKFlag = () => (
	<svg viewBox="0 0 24 16" className="w-4 h-2.5 rounded-sm">
		<rect width="24" height="16" fill="#012169" />
		<path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" strokeWidth="2" />
		<path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1" />
		<path d="M12,0 L12,16 M0,8 L24,8" stroke="#fff" strokeWidth="3" />
		<path d="M12,0 L12,16 M0,8 L24,8" stroke="#C8102E" strokeWidth="2" />
	</svg>
);

const EGFlag = () => (
	<svg viewBox="0 0 24 16" className="w-4 h-2.5 rounded-sm">
		<rect width="24" height="16" fill="#fff" />
		<rect width="24" height="5.33" fill="#CE1126" />
		<rect width="24" height="5.33" y="5.33" fill="#fff" />
		<rect width="24" height="5.33" y="10.67" fill="#000" />
		<g transform="translate(12,8)">
			<circle r="2" fill="#FFD700" />
			<path d="M-1.5,-0.5 L1.5,-0.5 L1.5,0.5 L-1.5,0.5 Z" fill="#8B4513" />
		</g>
	</svg>
);

const languages: Language[] = [
	{
		code: "En",
		label: "English",
		flag: <UKFlag />,
	},
	{
		code: "Ar",
		label: "العربية",
		flag: <EGFlag />,
	},
];

export function LanguageDropdown({
	currentLanguage,
	onLanguageChange,
	className,
}: LanguageDropdownProps) {
	const currentLang = languages.find((lang) => lang.code === currentLanguage);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className={cn(
						"inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm hover:shadow group",
						className
					)}
				>
					<div className="flex items-center gap-1">
						{currentLang?.flag}
						<span className="text-xs font-medium text-gray-700 hidden sm:inline">
							{currentLang?.code}
						</span>
					</div>
					<ChevronDown className="w-3 h-3 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="min-w-[140px] bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-lg p-1"
				sideOffset={5}
			>
				{languages.map((language) => (
					<DropdownMenuItem
						key={language.code}
						onClick={() => onLanguageChange(language.code)}
						className={cn(
							"flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150",
							"hover:bg-blue-50 focus:bg-blue-50 focus:outline-none",
							currentLanguage === language.code &&
								"bg-blue-100 text-blue-700 font-medium"
						)}
					>
						{language.flag}
						<span className="text-xs font-medium">{language.label}</span>
						{currentLanguage === language.code && (
							<div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
