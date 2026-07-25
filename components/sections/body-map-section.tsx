"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { InteractiveBodyMap } from "@/components/body-map";
import { BodyPart } from "@/types/body-map-types";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function BodyMapSection() {
	const router = useRouter();
	const t = useTranslations("sections.body_map.text");

	const handlePartClick = useCallback(
		(bodyPart: BodyPart) => {
			router.push(`/services/store?joint=${bodyPart.joint}`);
		},
		[router]
	);

	return (
		<section className="py-20 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div
					className="text-center max-w-3xl mx-auto mb-[-100px] md:mb-[-200px] lg:mb-[-300px]"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 0.8, type: "spring" }}
				>
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
						{t("shop_by_body_part")}
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-300">
						{t(
							"click_on_any_area_to_discover_products_designed_specifically_for_your_needs"
						)}
					</p>
				</motion.div>

				{/* Interactive Body Map */}
				<div className="max-w-6xl mx-auto mb-[-150px] md:mb-[-250px] lg:mb-[-400px] relative z-0">
					<InteractiveBodyMap onPartClick={handlePartClick} className="" />
				</div>

				{/* Call to Action */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5, duration: 0.6 }}
					className="text-center mt-8 md:mt-12 px-4 relative z-10"
				>
					<p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6">
						{t("not_sure_what_you_need_explore_our_full_collection")}
					</p>
					<Button
						onClick={() => router.push("/services/store")}
						variant="outline"
						size="lg"
						className="group w-full sm:w-auto"
					>
						{t("browse_all_products")}
						<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
