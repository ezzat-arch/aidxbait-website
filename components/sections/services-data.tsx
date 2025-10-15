import {
        Activity,
        Video,
        ShoppingBag,
        TestTube,
	Stethoscope,
	BookOpen,
	Heart,
} from "lucide-react";

export const services = [
	{
		slug: "home-physical-therapy",
		icon: <Activity className="h-10 w-10 text-blue-600" />,
		title: "Home Physical Therapy",
		description:
			"Licensed physical therapists provide one-on-one treatment sessions at your home, including post-operative care and chronic condition management.",
		image: "/images/services1.png",
	},
	{
		slug: "virtual-consultations",
		icon: <Video className="h-10 w-10 text-purple-600" />,
		title: "Virtual Consultations",
		description:
			"Video calls with physical therapists, nutritionists, or psychologists — no travel needed.",
		image: "/images/services2.png",
	},
	{
		slug: "home-lab-testing",
		icon: <TestTube className="h-10 w-10 text-emerald-600" />,
		title: "Home Lab Testing",
		description:
			"We send a nurse to collect your blood or samples from home. Lab results are delivered digitally.",
		image: "/images/services3.png",
	},
	{
		slug: "at-home-radiology",
		icon: <Stethoscope className="h-10 w-10 text-red-600" />,
		title: "At-Home Radiology",
		description:
			"Portable X-rays and ultrasounds performed by our mobile technicians in your home.",
		image: "/images/services4.png",
	},
	{
		slug: "exercise-program-library",
		icon: <BookOpen className="h-10 w-10 text-orange-600" />,
		title: "Exercise Program Library",
		description:
			"Personalized video-based rehab programs sent after your consultation for follow-up care.",
		image: "/images/services1.png",
	},
	{
		slug: "medical-equipment-store",
		icon: <ShoppingBag className="h-10 w-10 text-pink-600" />,
		title: "Medical Equipment Store",
		description:
			"Browse and order mobility aids, braces, and more — all delivered to your doorstep.",
		image: "/images/services2.png",
	},
	{
		slug: "home-nursing-care",
		icon: <Heart className="h-10 w-10 text-teal-600" />,
		title: "Home Nursing Care",
		description:
			"Professional nurses available for home visits to provide medication administration, wound care, post-operative support, IV therapy, and chronic condition management — all in the comfort of your home.",
		image: "/images/services3.png",
	},
];
