import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { FooterLink } from "./footer-link";
import { useTranslations } from "next-intl";

export function Footer() {
	const tFooter = useTranslations("layout.footer.text");
	const tAlt = useTranslations("layout.footer.attr.alt");
	const tNavbar = useTranslations("ui.navbar.text");
	return (
		<footer className="bg-gray-900 text-gray-300">
			<div className="container py-12">
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div>
						<Link href="/" className="inline-block mb-6">
							<Image
								src="/images/logo-icon.png"
								alt={tAlt("doctoory_logo")}
								width={50}
								height={50}
								className="h-12 w-auto"
							/>
						</Link>
						<p className="mb-6 max-w-xs">
							{tFooter("revolutionizing_orthopedic_care_through_technology")}
						</p>
						<div className="flex gap-4">
							<Link
								href="#"
								className="p-2 bg-gray-800 rounded-full hover:bg-primary/20 transition-colors"
							>
								<Facebook className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="p-2 bg-gray-800 rounded-full hover:bg-primary/20 transition-colors"
							>
								<Twitter className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="p-2 bg-gray-800 rounded-full hover:bg-primary/20 transition-colors"
							>
								<Instagram className="h-5 w-5" />
							</Link>
							<Link
								href="#"
								className="p-2 bg-gray-800 rounded-full hover:bg-primary/20 transition-colors"
							>
								<Linkedin className="h-5 w-5" />
							</Link>
						</div>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-6 text-white">{tFooter("quick_links")}</h3>
						<ul className="space-y-3">
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									{tFooter("home")}
								</Link>
							</li>
							<li>
								<Link
									href="#testimonials"
									className="hover:text-primary transition-colors"
								>
									{tFooter("testimonials")}
								</Link>
							</li>
							<li>
								<Link
									href="#contact"
									className="hover:text-primary transition-colors"
								>
									{tFooter("contact")}
								</Link>
							</li>
							<li>
								<Link
									href="#about"
									className="hover:text-primary transition-colors"
								>
									{tNavbar("about")}
								</Link>
							</li>
						</ul>
					</div>

					<div className="lg:col-span-2 hidden">
						<h3 className="text-lg font-bold mb-6 text-white">{tFooter("services")}</h3>
						<div className="grid grid-cols-2 gap-x-12">
							<ul className="space-y-2.5">
								{/* Home visits */}
								<li>
									<FooterLink href="#" isParent comingSoon>
										{tNavbar("home_visits")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("home_visits_physical_therapy")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("home_visits_specialist_doctors")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("home_visits_nursing")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("home_visits_imaging")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("home_visits_lab_services")}
									</FooterLink>
								</li>

								{/* Online consultations */}
								<li className="mt-4">
									<FooterLink href="#" isParent comingSoon>
										{tFooter("online_consultations")}
									</FooterLink>
								</li>

								{/* Exercise Programs */}
								<li className="mt-4">
									<FooterLink href="#" isParent>
										{tFooter("exercise_programs")}
									</FooterLink>
								</li>
							</ul>
							<ul className="space-y-2.5">
								{/* Store */}
								<li>
									<FooterLink href="#" isParent>
										{tNavbar("store")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("store_support_braces_walking_aids")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("medical_devices")}
									</FooterLink>
								</li>
								<li className="pl-6">
									<FooterLink href="#" level={3}>
										{tNavbar("store_blood_glucose_monitoring")}
									</FooterLink>
								</li>
								<li className="pl-6">
									<FooterLink href="#" level={3}>
										{tNavbar("store_blood_pressure_monitoring")}
									</FooterLink>
								</li>
								<li className="pl-6">
									<FooterLink href="#" level={3}>
										{tNavbar("store_oximeters")}
									</FooterLink>
								</li>
								<li className="pl-6">
									<FooterLink href="#" level={3}>
										{tNavbar("store_thermometers")}
									</FooterLink>
								</li>
								<li className="pl-3">
									<FooterLink href="#" level={2}>
										{tNavbar("store_rental_equipment")}
									</FooterLink>
								</li>
							</ul>
						</div>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-6 text-white">{tFooter("download_app")}</h3>
						<p className="mb-6">
							{tFooter("get_the_doctoory_app_for")}
						</p>
						<div className="flex flex-row gap-4">
							<Link
								href="/download/ios"
								className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
							>
								<img
									src="/images/app-store-badge-black.svg"
									alt={`${tFooter("download_on_the")} ${tFooter("app_store")}`}
									className="h-[40px] w-auto"
								/>
							</Link>
							<Link
								href="/download/android"
								className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
							>
								<img
									src="/images/google-play-badge.png"
									alt={`${tFooter("get_it_on")} ${tFooter("google_play")}`}
									className="h-[40px] w-auto"
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-gray-800 py-6">
				<div className="container flex flex-col sm:flex-row justify-between items-center">
					<p className="text-sm">{tFooter("2025_doctoory_all_rights_reserved")}</p>
					<div className="flex gap-6 mt-4 sm:mt-0">
						<Link
							href="/privacy-policy"
							className="text-sm hover:text-primary transition-colors"
						>
							{tFooter("privacy_policy")}
						</Link>
						<Link
							href="/terms-and-conditions"
							className="text-sm hover:text-primary transition-colors"
						>
							{tFooter("terms_of_service")}
						</Link>
						<Link
							href="/return-and-refund-policy"
							className="text-sm hover:text-primary transition-colors"
						>
							{tFooter("return_and_refund_policy")}
						</Link>
						<Link
							href="/shipping-policy"
							className="text-sm hover:text-primary transition-colors"
						>
							{tFooter("shipping_policy")}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
