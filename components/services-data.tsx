import React from "react";
import { Calendar, Activity, Video, ShoppingBag } from "lucide-react";

export const services = [
	{
		slug: "pt-home-visits",
		icon: <Calendar className="h-10 w-10 text-blue-600" />,
		title: "PT Home Visits",
		description:
			"Book physical therapy home visits in convenient packages, with local therapists able to accept or decline requests.",
		image: "/images/services1.png",
	},
	{
		slug: "exercise-programs",
		icon: <Activity className="h-10 w-10 text-emerald-600" />,
		title: "Exercise Programs",
		description:
			"Access guided, customizable rehab programs with progress tracking and secure, in-app instructional videos.",
		image: "/images/services2.png",
	},
	{
		slug: "store",
		icon: <ShoppingBag className="h-10 w-10 text-pink-600" />,
		title: "Store",
		description:
			"Browse and purchase rehab products with easy filtering, secure payments, and real-time order tracking.",
		image: "/images/services3.png",
	},
	{
		slug: "online-consultations",
		icon: <Video className="h-10 w-10 text-purple-600" />,
		title: "Online Consultations",
		description:
			"Book video consultations with doctors, get reminders, and receive expert follow-up and record updates.",
		image: "/images/services4.png",
	},
];
