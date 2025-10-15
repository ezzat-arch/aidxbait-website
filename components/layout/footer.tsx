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
						<div className="flex flex-col gap-4">
							<Link
								href="#"
								className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
							>
								<svg
									className="h-8 w-8"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.21 2.33-.91 3.57-.84 1.5.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.66 4.23-3.74 4.25z" />
								</svg>
								<div>
									<div className="text-xs">Download on the</div>
									<div className="text-sm font-medium">App Store</div>
								</div>
							</Link>
							<Link
								href="#"
								className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
							>
								<svg
									className="h-8 w-8"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 0 1-.293-.707V2.521c0-.265.106-.52.293-.707zM14.5 12.707l2.302 2.302-8.557 4.883L14.5 12.707zm0-1.414L8.245 4.107l8.557 4.883L14.5 11.293zm3.366 3.716L15.207 12l2.659-2.66 2.65 1.51c.65.373.65 1.292 0 1.665l-2.65 1.51z" />
								</svg>
								<div>
									<div className="text-xs">Get it on</div>
									<div className="text-sm font-medium">Google Play</div>
								</div>
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
