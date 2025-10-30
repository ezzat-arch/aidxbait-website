import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
	return (
		<footer className="bg-gray-900 text-gray-300">
			<div className="container py-12">
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div>
						<Link href="/" className="inline-block mb-6">
							<Image
								src="/images/logo-icon.png"
								alt="AidXBait Logo"
								width={50}
								height={50}
								className="h-12 w-auto"
							/>
						</Link>
						<p className="mb-6 max-w-xs">
							Revolutionizing orthopedic care through technology, making
							recovery more accessible and effective.
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
						<h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
						<ul className="space-y-3">
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Home
								</Link>
							</li>
							<li>
								<Link
									href="#services"
									className="hover:text-primary transition-colors"
								>
									Services
								</Link>
							</li>
							<li>
								<Link
									href="#how-it-works"
									className="hover:text-primary transition-colors"
								>
									How It Works
								</Link>
							</li>
							<li>
								<Link
									href="#app"
									className="hover:text-primary transition-colors"
								>
									Our App
								</Link>
							</li>
							<li>
								<Link
									href="#testimonials"
									className="hover:text-primary transition-colors"
								>
									Testimonials
								</Link>
							</li>
							<li>
								<Link
									href="#contact"
									className="hover:text-primary transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-6 text-white">Services</h3>
						<ul className="space-y-3">
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Physical Therapy
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Virtual Consultations
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Exercise Protocols
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Appointment Booking
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Recovery Tracking
								</Link>
							</li>
							<li>
								<Link href="#" className="hover:text-primary transition-colors">
									Specialist Network
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-bold mb-6 text-white">Download App</h3>
						<p className="mb-6">
							Get the AidXBait app for iOS and Android to access all features on
							the go.
						</p>
						<div className="flex flex-row gap-4">
							<Link
								href="/download/ios"
								className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
							>
								<img
									src="/images/app-store-badge-black.svg"
									alt="Download on the App Store"
									className="h-[40px] w-auto"
								/>
							</Link>
							<Link
								href="/download/android"
								className="inline-block transition-all duration-300 hover:opacity-80 hover:scale-105"
							>
								<img
									src="/images/google-play-badge.png"
									alt="Get it on Google Play"
									className="h-[40px] w-auto"
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-gray-800 py-6">
				<div className="container flex flex-col sm:flex-row justify-between items-center">
					<p className="text-sm">© 2025 AidXBait. All rights reserved.</p>
					<div className="flex gap-6 mt-4 sm:mt-0">
						<Link
							href="#"
							className="text-sm hover:text-primary transition-colors"
						>
							Privacy Policy
						</Link>
						<Link
							href="#"
							className="text-sm hover:text-primary transition-colors"
						>
							Terms of Service
						</Link>
						<Link
							href="#"
							className="text-sm hover:text-primary transition-colors"
						>
							Cookie Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
