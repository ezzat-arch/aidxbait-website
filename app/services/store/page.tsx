import { Suspense } from "react";
import { StoreContent } from "@/components/store/StoreContent";

function StoreLoadingFallback() {
	return (
		<div className="min-h-screen bg-background pt-20">
			{/* Hero Section Skeleton */}
			<div className="relative h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden bg-primary/20 animate-pulse">
				<div className="relative h-full flex items-center justify-center">
					<div className="text-center px-4 max-w-4xl mx-auto">
						<div className="h-8 w-64 bg-white/20 rounded-full mx-auto mb-6"></div>
						<div className="h-12 w-96 bg-white/20 rounded-lg mx-auto mb-6"></div>
						<div className="flex items-center justify-center gap-6">
							<div className="h-8 w-32 bg-white/20 rounded"></div>
							<div className="h-8 w-32 bg-white/20 rounded"></div>
							<div className="h-8 w-32 bg-white/20 rounded"></div>
						</div>
					</div>
				</div>
			</div>

			{/* Content Skeleton */}
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 h-16 bg-muted rounded-lg animate-pulse"></div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							className="h-96 bg-muted rounded-lg animate-pulse"
						></div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function StorePage() {
	return (
		<Suspense fallback={<StoreLoadingFallback />}>
			<StoreContent />
		</Suspense>
	);
}
