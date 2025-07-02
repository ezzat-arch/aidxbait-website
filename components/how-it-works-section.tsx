"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function HowItWorksSection() {
	const cards = data.map((card, index) => (
		<Card key={card.src} card={card} index={index} />
	));

	return (
		<section className="py-20 bg-white">
			<div className="container max-w-7xl mx-auto px-4">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<h2 className="text-3xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
						How It Works
					</h2>
					<p className="text-lg text-gray-600 mt-6">
						Getting the healthcare you need has never been easier. Follow these
						simple steps to start your care journey.
					</p>
				</div>
				<Carousel items={cards} />

				{/* Medical Supplies Section */}
				<div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mt-16 max-w-4xl mx-auto">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg
								className="h-6 w-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
								/>
							</svg>
						</div>
						<div>
							<h3 className="text-xl font-bold mb-2 text-gray-900">
								🏠 Need Medical Supplies?
							</h3>
							<p className="text-gray-600 mb-4">
								Visit our{" "}
								<a
									href="/services/store"
									className="text-primary hover:text-primary/80 font-medium underline"
								>
									Online Store
								</a>{" "}
								to order braces, mobility aids, rehab equipment, and more — all
								delivered to your home, no appointment required.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

const DummyContent = ({ stepNumber }: { stepNumber: number }) => {
	const content = [
		{
			title: "Choose Your Service",
			description:
				"Our platform offers comprehensive healthcare services tailored to your needs. Browse through our options and select what works best for your situation.",
			features: [
				"Home physical therapy sessions",
				"At-home radiology and imaging",
				"Laboratory tests in your home",
				"Virtual consultations with specialists",
			],
		},
		{
			title: "Book Your Appointment",
			description:
				"Schedule your appointment at a time that works for you. Our team will coordinate with healthcare professionals in your area.",
			features: [
				"Flexible scheduling options",
				"Real-time availability updates",
				"Confirmation and reminders",
				"Easy rescheduling if needed",
			],
		},
		{
			title: "Receive Care at Home",
			description:
				"Licensed healthcare professionals come to you with all necessary equipment and expertise. No travel, no waiting rooms.",
			features: [
				"Licensed, certified professionals",
				"All equipment provided",
				"Safe, sanitized environment",
				"Personalized care experience",
			],
		},
		{
			title: "Follow Up & Track Progress",
			description:
				"Stay connected with your healthcare team through our app. Access reports, track recovery, and continue your care journey.",
			features: [
				"Digital health reports",
				"Progress tracking tools",
				"Direct communication with providers",
				"Ongoing support and guidance",
			],
		},
	];

	const currentContent = content[stepNumber] || content[0];

	return (
		<>
			<div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
				<h3 className="text-neutral-600 dark:text-neutral-400 text-xl md:text-2xl font-bold mb-4">
					{currentContent.title}
				</h3>
				<p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg font-sans max-w-3xl mx-auto mb-6">
					{currentContent.description}
				</p>
				<ul className="text-left space-y-3 mb-6">
					{currentContent.features.map((feature, idx) => (
						<li
							key={idx}
							className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400"
						>
							<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

const data = [
	{
		category: "Step 1",
		title: "Choose a Service",
		src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		content: <DummyContent stepNumber={0} />,
	},
	{
		category: "Step 2",
		title: "Book Your Appointment",
		src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2515&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		content: <DummyContent stepNumber={1} />,
	},
	{
		category: "Step 3",
		title: "Receive Care at Home or Online",
		src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		content: <DummyContent stepNumber={2} />,
	},
	{
		category: "Step 4",
		title: "Follow Up & Stay Connected",
		src: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
		content: <DummyContent stepNumber={3} />,
	},
];
