import Link from "next/link";

interface FooterLinkProps {
	href: string;
	children: React.ReactNode;
	comingSoon?: boolean;
	isParent?: boolean;
	level?: 1 | 2 | 3; // Nesting level for visual hierarchy
}

export function FooterLink({
	href,
	children,
	comingSoon = false,
	isParent = false,
	level = 1,
}: FooterLinkProps) {
	// Determine styling based on level
	const getLevelStyles = () => {
		if (isParent) {
			return "text-base font-semibold text-white";
		}
		switch (level) {
			case 2:
				return "text-sm text-gray-400";
			case 3:
				return "text-xs text-gray-500";
			default:
				return "text-base text-gray-300";
		}
	};

	return (
		<Link
			href={href}
			className={`hover:text-primary transition-colors inline-flex items-baseline gap-2 ${getLevelStyles()}`}
		>
			<span className="inline-flex items-baseline gap-2">
				{children}
				{comingSoon && (
					<span className="text-[10px] text-red-400 italic font-normal ml-1.5 whitespace-nowrap">
						coming soon
					</span>
				)}
			</span>
		</Link>
	);
}

