"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/types/i18n";
import { useAuth } from "@/contexts/auth-context";

export const HeroSection = React.forwardRef<
	HTMLElement,
	{
		navbar?: React.ReactNode;
		sentinelRef?: React.RefObject<HTMLDivElement | null>;
	}
>(function HeroSection({ navbar, sentinelRef }, ref) {
	const locale = useLocale() as Locale;
	const t = useTranslations("sections.hero.text");
	const tAlt = useTranslations("sections.hero.attr.alt");
	const tFooter = useTranslations("layout.footer.text");
	const tCommon = useTranslations("common.text");
	const { user, loading } = useAuth();
	const isRTL = locale === "ar";
	console.log("[HeroSection] Render state:", {
		loading,
		user: !!user,
	});
	const isAuth = !!user;
	return (
		<div className="flex flex-col">
			{/* First Hero Section */}
			<section
				ref={ref}
				className="relative min-h-screen hero-height flex items-center p-0 m-0 overflow-x-hidden"
			>
				<Image
					src="/images/doctoory_logo_phone.jpg"
					alt={tAlt("hero_background")}
					fill
					priority
					className="object-cover opacity-80 z-0"
					sizes="100vw"
				/>
				{navbar && (
					<div className="fixed top-0 left-0 w-full z-50">{navbar}</div>
				)}
				<div className="absolute inset-0 bg-black/70 z-10" />
				<div className="container relative z-20 px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
					<div className="grid gap-2 sm:gap-8 lg:grid-cols-2 lg:gap-16 items-center justify-items-center pt-32 sm:pt-20 md:pt-24 lg:pt-0 hero-content max-w-7xl mx-auto">
						<div className="w-full flex ltr:lg:justify-end pt-20 rtl:lg:justify-start justify-center">
							<motion.div
								initial={{ opacity: 0, x: -100 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.7 }}
								viewport={{ once: true, amount: 0.5 }}
								className="flex flex-col gap-2 sm:gap-6 text-center ltr:lg:text-left rtl:lg:text-right items-center ltr:lg:items-start rtl:lg:items-end ltr:lg:pr-4 rtl:lg:pl-4"
							>
								<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white font-bold tracking-tight leading-tight hero-heading">
									{t("unlock")}
									<br />
									{t("the_potentials_of")}
									<br />
									<span className="text-primary">{t("home_care")}</span>
								</h1>
								<p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl leading-relaxed hero-description">
									{t("stay_at_home_and_order")}
								</p>

								<div className="flex flex-col gap-4 mt-0 sm:mt-6 hero-badges w-full items-center ltr:lg:items-start rtl:lg:items-end">
									{/* Action buttons row */}
									<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center ltr:lg:justify-start rtl:lg:justify-end items-stretch sm:items-center">
										{/* Get Started Button */}
										{!isAuth && (
											<Link
												href="/login"
												className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/90 text-white font-semibold px-6 h-[48px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-[0.98]"
											>
												{t("get_started")}
												<ArrowRight className="h-5 w-5 rtl:rotate-180" />
											</Link>
										)}
									</div>
									{/* App store badges row */}
									<div className="flex flex-row gap-3 sm:gap-4 justify-center ltr:lg:justify-start rtl:lg:justify-end items-center">
										<Link
											href="/download/ios"
											className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
										>
											<Image
												src="/images/app-store-badge-black.svg"
												alt={`${tFooter("download_on_the")} ${tFooter("app_store")}`}
												width={135}
												height={40}
												className="h-[40px] sm:h-[45px] md:h-[50px] w-auto"
											/>
										</Link>
										<Link
											href="/download/android"
											className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
										>
											<Image
												src="/images/google-play-badge.png"
												alt={`${tFooter("get_it_on")} ${tFooter("google_play")}`}
												width={135}
												height={40}
												className="h-[40px] sm:h-[45px] md:h-[50px] w-auto"
											/>
										</Link>
									</div>
								</div>

							</motion.div>
						</div>
						<div className="w-full flex ltr:lg:justify-start rtl:lg:justify-end justify-center ltr:lg:pl-16 rtl:lg:pr-16 pb-6 lg:pb-8">
							<motion.div
								initial={{ opacity: 0, x: 100 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.7 }}
								viewport={{ once: true, amount: 0.5 }}
								className="relative w-full max-w-xs sm:max-w-md md:max-w-lg h-[217px] sm:h-[300px] md:h-[350px] lg:h-[450px] mt-6 sm:mt-8 lg:mt-0 lg:animate-float hero-image-container"
							>
								<div className="hidden lg:block absolute top-0 ltr:-left-14 rtl:-right-14 w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl transform ltr:-rotate-3 rtl:rotate-3"></div>
								<div className="relative w-full h-full bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:absolute lg:top-4 ltr:lg:left-4 rtl:lg:right-4 lg:p-6">
									<div className="w-full h-full flex items-center justify-center">
										<Image
											src="/images/hero_image_in.png"
											alt={tAlt("patient_connecting_with_healthcare_professional_at_home")}
											width={400}
											height={400}
											className="rounded-xl shadow-lg w-full h-full object-cover"
										/>
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
				<div
					className="absolute top-0 left-0 w-full z-40"
					style={{ height: 1 }}
					ref={sentinelRef}
				/>
			</section>

			{/* Second Hero Section - Uber Style */}
			<section className="py-16 lg:py-24 bg-white overflow-x-hidden">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl overflow-x-hidden">
					<div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
						{/* Left side - Image */}
						<div className="overflow-x-hidden w-full lg:w-1/2">
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, ease: "easeOut" }}
								viewport={{ once: true, amount: 0.3 }}
								className="w-full order-1 lg:order-1"
							>
								<div className="relative max-w-sm mx-auto lg:max-w-md lg:mx-0">
									<Image
										src="/images/doctoory_logo_phone.jpg"
										alt={tAlt("home_medical_care_doctor_visiting")}
										width={400}
										height={300}
										className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[3/3]"
										priority
									/>
									<div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-blue-400/20 rounded-2xl pointer-events-none" />
								</div>
							</motion.div>
						</div>

						{/* Right side - Content */}
						<div className="overflow-x-hidden w-full lg:w-1/2">
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
								viewport={{ once: true, amount: 0.3 }}
								className="w-full order-2 lg:order-2"
							>
								<div className="lg:pl-8">
									{/* Headline */}
									<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
										{t("get_medical_care")}{" "}
										<span className="text-blue-600">{t("at_home")}</span>
										{t("on_your_schedule")}
									</h1>

									{/* Description */}
									<p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
										{t("book_healthcare_services_from_the")}
									</p>

									{/* CTA Section - always visible for all users */}
									<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
										{/* Primary CTA - Get Started → Login */}
										<Link
											href="/login"
											className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-200 hover:shadow-xl active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
										>
											{/* Shimmer effect */}
											<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

											{/* Sparkle icon — subtle accent */}
											<Sparkles className="ltr:mr-2 rtl:ml-2 h-4 w-4 opacity-80 transition-transform duration-200 group-hover:rotate-12" />

											<span className="text-base">{t("get_started")}</span>

											<ArrowRight className="ltr:ml-2 rtl:mr-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180" />
										</Link>

										{/* Secondary — Already have an account? Log in */}
										<Link
											href="/login"
											className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-medium text-gray-600 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:whitespace-nowrap"
										>
											{t("already_have_an_account")}{" "}
											<span className="font-semibold text-blue-600">
												{t("log_in")}
											</span>
											<ArrowRight className="h-3.5 w-3.5 text-blue-500 rtl:rotate-180" />
										</Link>
									</div>

									{/* Trust indicators */}
									<div className="mt-10 pt-8 border-t border-gray-100">
										<div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-500">
											<div className="flex items-center gap-2">
												<span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
													<span className="h-2 w-2 rounded-full bg-green-500" />
												</span>
												<span>{tCommon("licensed_professionals")}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100">
													<span className="h-2 w-2 rounded-full bg-blue-500" />
												</span>
												<span>{t("24_7_support")}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100">
													<span className="h-2 w-2 rounded-full bg-purple-500" />
												</span>
												<span>{t("secure_private")}</span>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
});