import { useState, useEffect } from "react";
import Image from "next/image";
import {
	Calendar,
	Activity,
	Video,
	ShoppingBag,
	Clock,
	Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
<<<<<<< HEAD
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const services = [
	{
		icon: <Activity className="h-10 w-10 text-primary" />,
		title: "Automated Physical Therapy",
		description:
			"Personalized therapy protocols with real-time feedback and progress tracking.",
		image: "/placeholder.svg?height=120&width=120",
	},
	{
		icon: <Calendar className="h-10 w-10 text-primary" />,
		title: "Seamless Appointment Booking",
		description:
			"Book in-person or virtual consultations with specialists in just a few taps.",
		image: "/placeholder.svg?height=120&width=120",
	},
	{
		icon: <Video className="h-10 w-10 text-primary" />,
		title: "Virtual Consultations",
		description:
			"Connect with orthopedic specialists from the comfort of your home.",
		image: "/placeholder.svg?height=120&width=120",
	},
	{
		icon: <ShoppingBag className="h-10 w-10 text-primary" />,
		title: "Exercise Protocol Marketplace",
		description:
			"Purchase specialized exercise protocols designed for your specific injury.",
		image: "/placeholder.svg?height=120&width=120",
	},
	{
		icon: <Clock className="h-10 w-10 text-primary" />,
		title: "Post-Op Recovery Tracking",
		description:
			"Monitor your recovery progress with detailed analytics and insights.",
		image: "/placeholder.svg?height=120&width=120",
	},
	{
		icon: <Smartphone className="h-10 w-10 text-primary" />,
		title: "Mobile Accessibility",
		description:
			"Access all features through our intuitive mobile application anytime, anywhere.",
		image: "/placeholder.svg?height=120&width=120",
	},
=======
  CardTitle,
  CardDescription,
  CardSkeletonContainer,
  Card,
  Skeleton,
} from "@/components/ui/cards-demo-3";

const services = [
  {
    icon: <Calendar className="h-10 w-10 text-blue-600" />,
    title: "PT Home Visits",
    description:
      "Book physical therapy home visits in convenient packages, with local therapists able to accept or decline requests.",
  },
  {
    icon: <Activity className="h-10 w-10 text-emerald-600" />,
    title: "Exercise Programs",
    description:
      "Access guided, customizable rehab programs with progress tracking and secure, in-app instructional videos.",
  },
  {
    icon: <ShoppingBag className="h-10 w-10 text-pink-600" />,
    title: "Store",
    description:
      "Browse and purchase rehab products with easy filtering, secure payments, and real-time order tracking.",
  },
  {
    icon: <Video className="h-10 w-10 text-purple-600" />,
    title: "Online Consultations",
    description:
      "Book video consultations with doctors, get reminders, and receive expert follow-up and record updates.",
  },
>>>>>>> 5abbd06 (additions)
];

function ServiceCard({
  service,
  idx,
}: {
  service: (typeof services)[0];
  idx: number;
}) {
  let bgImage = "/images/services1.png";
  if (idx === 1) bgImage = "/images/services2.png";
  if (idx === 2) bgImage = "/images/services3.png";
  if (idx === 3) bgImage = "/images/services4.png";
  return (
    <Card className="relative overflow-hidden">
      <Image
        src={bgImage}
        alt="Service background"
        fill
        className="object-cover object-center absolute inset-0 z-0 opacity-30 pointer-events-none select-none"
        priority
      />
      <div className="relative z-10">
        <CardSkeletonContainer>
          <Skeleton icon={service.icon} />
        </CardSkeletonContainer>
        <CardTitle className="text-center mt-2 mb-1">{service.title}</CardTitle>
        <CardDescription className="text-center mb-2 text-neutral-600 dark:text-neutral-400 max-w-sm">
          {service.description}
        </CardDescription>
      </div>
    </Card>
  );
}

export function ServicesSection() {
<<<<<<< HEAD
	const [activeIndex, setActiveIndex] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % services.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<section id="services" className="py-20 bg-white">
			<div className="container">
				<motion.div
					className="text-center max-w-3xl mx-auto mb-16"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.5 }}
					transition={{ duration: 3, type: "spring" }}
				>
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Our Comprehensive Services
					</h2>
					<p className="text-lg text-gray-600">
						AidXBait offers a complete ecosystem for orthopedic care, from
						post-operative recovery to ongoing physical therapy.
					</p>
				</motion.div>
				<div className="flex flex-col md:flex-row gap-12 items-center md:items-start justify-center">
					{/* List on the left with entrance animation */}
					<motion.ul
						className="flex flex-col gap-4 w-full md:w-1/2 max-w-xs"
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
										: "text-gray-700 hover:bg-gray-100"
								}`}
								onClick={() => setActiveIndex(idx)}
								style={{
									opacity: activeIndex === idx ? 1 : 0.7,
									transform: activeIndex === idx ? "scale(1.05)" : "scale(1)",
								}}
							>
								<div className="flex items-center gap-3">
									{service.icon}
									{service.title}
								</div>
							</li>
						))}
					</motion.ul>
					{/* Preview on the right with entrance animation */}
					<motion.div
						className="w-full md:w-1/2 flex justify-center"
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
								className="bg-gray-50 rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center"
							>
								<div className="mb-4">
									<Image
										src={services[activeIndex].image}
										alt={services[activeIndex].title}
										width={120}
										height={120}
										className="object-contain"
									/>
								</div>
								<h3 className="text-xl font-bold mb-2 flex items-center gap-2">
									{services[activeIndex].icon}
									{services[activeIndex].title}
								</h3>
								<p className="text-gray-700 text-base text-center">
									{services[activeIndex].description}
								</p>
							</motion.div>
						</AnimatePresence>
					</motion.div>
				</div>
			</div>
		</section>
	);
=======
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % services.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 3, type: "spring" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Comprehensive Services
          </h2>
          <p className="text-lg text-gray-600">
            AidXBait offers a complete ecosystem for orthopedic care, from
            post-operative recovery to ongoing physical therapy.
          </p>
        </motion.div>
        <div className="flex flex-col md:flex-row gap-12 items-stretch justify-center">
          {/* List on the left with entrance animation */}
          <motion.ul
            className="flex flex-col gap-4 w-full md:w-1/2 max-w-xs min-h-[32rem] justify-center h-full"
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
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveIndex(idx)}
                style={{
                  opacity: activeIndex === idx ? 1 : 0.7,
                  transform: activeIndex === idx ? "scale(1.05)" : "scale(1)",
                }}
              >
                <div className="flex items-center gap-3">
                  {service.icon}
                  {service.title}
                </div>
              </li>
            ))}
          </motion.ul>
          {/* Preview on the right with entrance animation */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center min-h-[32rem]"
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
                className="w-full max-w-md flex flex-col items-center"
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
>>>>>>> 5abbd06 (additions)
}
