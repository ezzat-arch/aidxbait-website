"use client";

import { useEffect, useState } from "react";
import { eventService } from "@/lib/tracking/event-service";

interface ProductViewTrackerProps {
	productId: number;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
	const [viewStartTime] = useState<number>(Date.now());

	useEffect(() => {
		// Track view
		eventService.trackProductView(productId, document.referrer);

		// Track duration on unmount
		return () => {
			const durationSeconds = Math.floor((Date.now() - viewStartTime) / 1000);
			if (durationSeconds > 0) {
				eventService.trackProductViewDuration(productId, durationSeconds);
			}
		};
	}, [productId, viewStartTime]);

	return null;
}

