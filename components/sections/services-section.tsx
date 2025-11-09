import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import {
	CardTitle,
	CardDescription,
	CardSkeletonContainer,
	Card,
	Skeleton,
} from "@/components/ui/cards-demo-3";
import { services } from "./services-data";

function ServiceCard({
	service,
	idx,
}: {
	service: (typeof services)[0];
	idx: number;
}) {
	const tTitle = useTranslations("ui.navbar.text");
	const tDesc = useTranslations("sections.services.data.description");
	const tAlt = useTranslations("sections.services.attr.alt");

	const titleKeyBySlug: Record<string, string> = {
		"home-physical-therapy": "home_physical_therapy",
		"home-doctor-visits": "home_doctor_visits",
		"virtual-consultations": "online_video_consultations",
		"home-lab-testing": "home_lab_tests",
		"at-home-radiology": "at_home_radiology",
		"exercise-program-library": "home_exercise_programs",
		"medical-equipment-store": "medical_store",
		"home-nursing-care": "home_nursing",
	};

	const descKeyBySlug: Record<string, string> = {
		"home-physical-therapy": "licensed_physical_therapists_provide_one",
		"home-doctor-visits": "licensed_doctors_provide_one",
		"virtual-consultations": "video_calls_with_physical_therapists",
		"home-lab-testing": "we_send_a_nurse_to",
		"at-home-radiology": "portable_x_rays_and_ultrasounds",
		"exercise-program-library": "personalized_video_based_rehab_programs",
		"medical-equipment-store": "browse_and_order_mobility_aids",
		"home-nursing-care": "professional_nurses_available_for_home",
	};

	let bgImage = "/images/services1.png";
	if (idx === 1) bgImage = "/images/services2.png";
	if (idx === 2) bgImage = "/images/services3.png";
	if (idx === 3) bgImage = "/images/services4.png";
	return (
		<Card className="relative overflow-hidden w-full max-w-md min-h-[24rem] flex flex-col justify-center items-center p-8 shadow-lg">
			<Image
				src={bgImage}
				alt={tAlt("service_background")}
				fill
				className="object-cover object-center absolute inset-0 z-0 opacity-30 pointer-events-none select-none"
				priority
			/>
			<div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
				<CardSkeletonContainer>
					<Skeleton icon={service.icon} />
				</CardSkeletonContainer>
				<CardTitle className="text-center mt-4 mb-2 text-2xl">
					{tTitle(titleKeyBySlug[service.slug] ?? "")}
				</CardTitle>
				<CardDescription className="text-center mb-2 text-neutral-600 dark:text-neutral-400 max-w-md text-lg">
					{tDesc(descKeyBySlug[service.slug] ?? "")}
				</CardDescription>
			</div>
		</Card>
	);
}

export function ServicesSection() {
	const [activeIndex, setActiveIndex] = useState(0);
	const t = useTranslations("sections.services.text");
	const tTitle = useTranslations("ui.navbar.text");

	const titleKeyBySlug: Record<string, string> = {
		"home-physical-therapy": "home_physical_therapy",
		"home-doctor-visits": "home_doctor_visits",
		"virtual-consultations": "online_video_consultations",
		"home-lab-testing": "home_lab_tests",
		"at-home-radiology": "at_home_radiology",
		"exercise-program-library": "home_exercise_programs",
		"medical-equipment-store": "medical_store",
		"home-nursing-care": "home_nursing",
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % services.length);
		}, 7000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="py-20 bg-gray-50">
			<div className="container max-w-[1200px]">
				<motion.div
					className="text-center max-w-5xl mx-auto mb-20"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 3, type: "spring" }}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">{t("our_services")}</h2>
					<p className="text-lg text-black dark:text-white">
						{t("complete_healthcare_services_delivered_to")}
					</p>
				</motion.div>
				<div className="flex flex-col md:flex-row gap-16 items-start justify-center w-full">
					{/* List on the left with entrance animation */}
					<motion.ul
						className="hidden md:flex flex-col gap-6 w-full md:w-2/5 max-w-md min-h-[32rem] justify-center h-full"
						initial={{ opacity: 0, x: -60 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 1, type: "spring" }}
					>
						{services.map((service, idx) => (
							<li
								key={service.title}
								className={`cursor-pointer px-4 py-3 rounded-lg font-medium text-lg transition-colors duration-300 ${
									activeIndex === idx
										? "bg-primary/10 text-primary"
										: "text-black dark:text-white hover:bg-gray-100"
								}`}
								onClick={() => setActiveIndex(idx)}
								style={{
									opacity: activeIndex === idx ? 1 : 0.7,
									transform: activeIndex === idx ? "scale(1.05)" : "scale(1)",
								}}
							>
								<div className="flex items-center gap-3">
									{service.icon}
									{tTitle(titleKeyBySlug[service.slug] ?? "")}
								</div>
							</li>
						))}
					</motion.ul>
					{/* Preview on the right with entrance animation */}
					<motion.div
						className="w-full md:w-3/5 flex justify-center min-h-[40rem]"
						initial={{ opacity: 0, x: 60 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 1, type: "spring" }}
					>
						<AnimatePresence mode="wait">
							<motion.div
								key={activeIndex}
								initial={{ opacity: 0, x: 40 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -40 }}
								transition={{ duration: 0.5, type: "spring" }}
								className="w-full max-w-lg flex flex-col items-center"
							>
								<ServiceCard
									service={services[activeIndex]}
									idx={activeIndex}
								/>
							</motion.div>
						</AnimatePresence>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
