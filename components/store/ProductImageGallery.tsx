"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/lib/store-types";

interface ProductImageGalleryProps {
	images: ProductImage[];
	productName: string;
	mainImage: string;
	hasDiscount: boolean;
	discountPercentage: number;
	isBestSeller: boolean;
	isFeatured: boolean;
	isForRent: boolean;
	isInStock: boolean;
}

export function ProductImageGallery({
	images,
	productName,
	mainImage,
	hasDiscount,
	discountPercentage,
	isBestSeller,
	isFeatured,
	isForRent,
	isInStock,
}: ProductImageGalleryProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	return (
		<div className="space-y-4">
			<div className="relative aspect-square overflow-hidden rounded-lg border-2 border-border/50 shadow-lg">
				<Image
					src={images[selectedImageIndex]?.image_url || mainImage}
					alt={productName}
					fill
					className="object-cover"
					priority
				/>

				{/* Badges */}
				<div className="absolute top-4 left-4 flex flex-col gap-2">
					{hasDiscount && (
						<Badge variant="destructive" className="shadow-lg">
							-{discountPercentage}%
						</Badge>
					)}
					{isBestSeller && (
						<Badge className="bg-amber-500 hover:bg-amber-600 shadow-lg">
							Best Seller
						</Badge>
					)}
					{isFeatured && (
						<Badge className="bg-purple-500 hover:bg-purple-600 shadow-lg">
							Featured
						</Badge>
					)}
					{isForRent && (
						<Badge
							variant="outline"
							className="bg-background/80 backdrop-blur-sm shadow-lg"
						>
							For Rent
						</Badge>
					)}
				</div>

				{!isInStock && (
					<Badge
						variant="outline"
						className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm shadow-lg"
					>
						Out of Stock
					</Badge>
				)}
			</div>

			{/* Image Thumbnails */}
			{images.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-2">
					{images.map((image, index) => (
						<button
							key={image.id}
							onClick={() => setSelectedImageIndex(index)}
							className={`relative w-20 h-20 flex-shrink-0 rounded border-2 overflow-hidden transition-all ${
								selectedImageIndex === index
									? "border-primary scale-105 shadow-md"
									: "border-border hover:border-primary/50"
							}`}
						>
							<Image
								src={image.image_url}
								alt={`${productName} ${index + 1}`}
								fill
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

