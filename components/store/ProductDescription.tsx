"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDescriptionProps {
	description: string | null;
	descriptionAr: string | null;
}

export function ProductDescription({
	description,
	descriptionAr,
}: ProductDescriptionProps) {
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const shouldShowToggle =
		(descriptionAr && descriptionAr.length > 200) ||
		(description && description.length > 200);

	return (
		<div className="space-y-4">
			{/* Arabic Description (First) */}
			{descriptionAr && (
				<div dir="rtl" className="font-arabic">
					<p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
						{isDescriptionExpanded
							? descriptionAr
							: descriptionAr.length > 200
							? `${descriptionAr.substring(0, 200)}...`
							: descriptionAr}
					</p>
				</div>
			)}

			{/* English Description (Second) */}
			{description && (
				<div>
					<p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
						{isDescriptionExpanded
							? description
							: description.length > 200
							? `${description.substring(0, 200)}...`
							: description}
					</p>
				</div>
			)}

			{/* Show "See More/Less" button only if description is long enough */}
			{shouldShowToggle && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
					className="w-full flex items-center justify-center gap-2 hover:bg-primary/10"
				>
					{isDescriptionExpanded ? (
						<>
							<span>See Less</span>
							<ChevronUp className="h-4 w-4" />
						</>
					) : (
						<>
							<span>See More</span>
							<ChevronDown className="h-4 w-4" />
						</>
					)}
				</Button>
			)}

			{/* Show message if no description */}
			{!description && !descriptionAr && (
				<p className="text-muted-foreground text-lg leading-relaxed">
					No description available
				</p>
			)}
		</div>
	);
}

