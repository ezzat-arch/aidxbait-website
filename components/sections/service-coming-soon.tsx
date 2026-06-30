"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, Rocket, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

interface ServiceComingSoonProps {
	serviceName: string;
	description?: string;
}

const BRAND_NAME = "Doctoory";

export function ServiceComingSoon({
	serviceName,
	description,
}: ServiceComingSoonProps) {
	const [mounted, setMounted] = useState(false);
	const t = useTranslations("sections.coming_soon.text");

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 pt-40 pb-12 px-4 flex items-center">
			<div
				className={`max-w-4xl mx-auto w-full transition-all duration-1000 ${
					mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
				}`}
			>
				{/* Animated Badge */}
				<div className="flex justify-center mb-6">
					<div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white rounded-full shadow-xl border-2 border-white animate-pulse">
						<Sparkles
							className="h-5 w-5 animate-spin"
							style={{ animationDuration: "3s" }}
						/>
						<span className="font-bold text-base uppercase tracking-wider">
							{t("badge")}
						</span>
						<Sparkles
							className="h-5 w-5 animate-spin"
							style={{ animationDuration: "3s" }}
						/>
					</div>
				</div>

				{/* Main Content */}
				<div className="text-center space-y-4">
					{/* Service Name */}
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
						{serviceName}
					</h1>

					{/* Description */}
					{description && (
						<p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
							{description}
						</p>
					)}

					{/* Status Message */}
					<div className="pt-4 pb-4">
						<div className="inline-block relative">
							<div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
							<div className="relative bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
								<div className="flex flex-col items-center gap-4">
									<div className="flex gap-4 text-blue-600">
										<Clock className="h-10 w-10 animate-bounce" />
										<Rocket className="h-10 w-10 animate-bounce delay-100" />
										<Heart className="h-10 w-10 animate-bounce delay-200" />
									</div>
									<div className="space-y-3">
										<p className="text-base md:text-lg text-gray-700 leading-relaxed">
											{t("working_hard")}
										</p>
										<p className="text-sm md:text-base text-gray-600">
											{t.rich("team_designing", {
												brand: () => (
													<span className="font-bold text-blue-600">
														{BRAND_NAME}
													</span>
												),
											})}
										</p>
										<p className="text-sm md:text-base text-gray-600">
											{t("available_soon")}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Encouragement Section */}
					<div className="pt-4">
						<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 md:p-5 shadow-xl max-w-xl mx-auto">
							<p className="text-sm md:text-base text-white font-medium text-center">
								{t.rich("follow_us", {
									brand: () => <span className="font-bold">{BRAND_NAME}</span>,
								})}
							</p>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-20px);
					}
				}
				@keyframes float-delay {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-15px);
					}
				}
				@keyframes float-slow {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-25px);
					}
				}
				.animate-float {
					animation: float 3s ease-in-out infinite;
				}
				.animate-float-delay {
					animation: float-delay 4s ease-in-out infinite;
				}
				.animate-float-slow {
					animation: float-slow 5s ease-in-out infinite;
				}
				.delay-100 {
					animation-delay: 100ms;
				}
				.delay-200 {
					animation-delay: 200ms;
				}
			`}</style>
		</div>
	);
}
