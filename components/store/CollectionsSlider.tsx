"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ShopifyCollectionCard } from "@/components/store/ShopifyCollectionCard";
import type { ShopifyCollectionCardModel } from "@/lib/shopify/types";

import "swiper/css";
import "swiper/css/pagination";

type CollectionsSliderProps = {
	collections: ShopifyCollectionCardModel[];
};

export function CollectionsSlider({ collections }: CollectionsSliderProps) {
	return (
		<>
			{/* Mobile / tablet: auto-scrolling slider */}
			<div className="lg:hidden">
				<Swiper
					modules={[Autoplay, Pagination]}
					spaceBetween={16}
					slidesPerView={1.15}
					centeredSlides={false}
					grabCursor
					loop={collections.length > 1}
					autoplay={{
						delay: 2500,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					}}
					pagination={{ clickable: true }}
					breakpoints={{
						640: { slidesPerView: 2.15, spaceBetween: 16 },
					}}
					className="!pb-10"
				>
					{collections.map((collection) => (
						<SwiperSlide key={collection.id} className="h-auto">
							<ShopifyCollectionCard collection={collection} />
						</SwiperSlide>
					))}
				</Swiper>
			</div>

			{/* Desktop: grid */}
			<div className="hidden lg:grid lg:grid-cols-3 gap-6">
				{collections.map((collection) => (
					<ShopifyCollectionCard
						key={collection.id}
						collection={collection}
					/>
				))}
			</div>
		</>
	);
}
