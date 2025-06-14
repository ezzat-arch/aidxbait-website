import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

const testimonials = [
	{
		name: "Sarah Johnson",
		role: "Knee Replacement Patient",
		image: "/placeholder.svg?height=80&width=80",
		content:
			"AidXBait transformed my recovery experience after knee replacement surgery. The guided exercises and progress tracking made a huge difference in my rehabilitation journey.",
		rating: 5,
	},
	{
		name: "Michael Chen",
		role: "Sports Injury Recovery",
		image: "/placeholder.svg?height=80&width=80",
		content:
			"As an athlete recovering from a shoulder injury, the personalized exercise protocols were exactly what I needed. The virtual consultations saved me so much time.",
		rating: 5,
	},
	{
		name: "Emily Rodriguez",
		role: "Physical Therapist",
		image: "/placeholder.svg?height=80&width=80",
		content:
			"From a professional perspective, AidXBait provides an exceptional platform for remote patient monitoring. The detailed analytics help me adjust treatment plans effectively.",
		rating: 4,
	},
	{
		name: "David Kim",
		role: "Hip Surgery Patient",
		image: "/placeholder.svg?height=80&width=80",
		content:
			"The app made it easy to follow my rehab plan after hip surgery. I loved the reminders and the ability to track my progress every day.",
		rating: 5,
	},
	{
		name: "Priya Patel",
		role: "Orthopedic Nurse",
		image: "/placeholder.svg?height=80&width=80",
		content:
			"AidXBait helps our team coordinate care and communicate with patients more efficiently. The platform is intuitive and reliable.",
		rating: 5,
	},
	{
		name: "James Lee",
		role: "ACL Recovery Patient",
		image: "/placeholder.svg?height=80&width=80",
		content:
			"After my ACL surgery, the app's video instructions and progress tracking kept me motivated. I highly recommend it to anyone in recovery.",
		rating: 5,
	},
];

export function TestimonialsSection() {
	return (
		<motion.section
			id="testimonials"
			className="py-20 bg-blue-50 overflow-x-hidden"
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.3 }}
			transition={{ duration: 1, type: "spring" }}
		>
			<div className="container">
				<div className="text-center max-w-3xl mx-auto mb-6">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						What Our Users Say
					</h2>
					<p className="text-lg text-gray-600">
						Discover how AidXBait is helping patients and healthcare
						professionals transform orthopedic care.
					</p>
				</div>
				<Carousel
					opts={{ align: "start", loop: true }}
					plugins={[Autoplay({ delay: 3000 })]}
				>
					<CarouselContent className="py-8 md:py-12">
						{testimonials.map((testimonial, index) => (
							<CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
								<Card className="bg-gradient-to-b from-white via-gray-50 to-white border border-gray-100 shadow-md hover:shadow-lg rounded-2xl h-full flex flex-col justify-between px-8 py-10">
									<CardContent className="flex-1 flex flex-col items-center text-center p-0">
										<div className="mb-4 text-primary">
											<svg
												width="36"
												height="36"
												fill="none"
												viewBox="0 0 36 36"
											>
												<path
													d="M13.5 12C13.5 8.686 10.814 6 7.5 6S1.5 8.686 1.5 12c0 2.485 2.015 4.5 4.5 4.5h1.5V21c0 2.485 2.015 4.5 4.5 4.5S16.5 23.485 16.5 21v-4.5C16.5 14.015 14.485 12 12 12h1.5zM34.5 12c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 2.485 2.015 4.5 4.5 4.5H28.5V21c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5v-4.5c0-2.485-2.015-4.5-4.5-4.5H34.5z"
													fill="currentColor"
													fillOpacity="0.08"
												/>
											</svg>
										</div>
										<div className="flex mb-4 justify-center">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`h-5 w-5 ${
														i < testimonial.rating
															? "text-yellow-400 fill-yellow-400"
															: "text-gray-300"
													}`}
												/>
											))}
										</div>
										<p className="text-gray-700 italic text-lg leading-relaxed mb-6">
											"{testimonial.content}"
										</p>
									</CardContent>
									<CardFooter className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6 mt-4 p-0">
										<Image
											src={testimonial.image || "/placeholder.svg"}
											alt={testimonial.name}
											width={56}
											height={56}
											className="rounded-full border-4 border-white shadow-md -mt-8 bg-white"
										/>
										<div className="text-center">
											<h4 className="font-semibold text-gray-900 text-base">
												{testimonial.name}
											</h4>
											<p className="text-sm text-gray-500">
												{testimonial.role}
											</p>
										</div>
									</CardFooter>
								</Card>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			</div>
		</motion.section>
	);
}
