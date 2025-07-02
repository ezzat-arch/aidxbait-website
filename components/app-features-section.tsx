import {
	CalendarCheck,
	FlaskConical,
	MessageCircle,
	Dumbbell,
	TrendingUp,
} from "lucide-react";

const features = [
	{
		icon: CalendarCheck,
		title: "Book appointments",
		description:
			"Schedule visits with healthcare professionals easily from your phone.",
	},
	{
		icon: FlaskConical,
		title: "View lab results",
		description: "Access your medical test results securely and anytime.",
	},
	{
		icon: MessageCircle,
		title: "Chat with providers",
		description:
			"Communicate directly with your care team for questions and advice.",
	},
	{
		icon: Dumbbell,
		title: "Access exercise plans",
		description: "Follow personalized exercise routines designed by experts.",
	},
	{
		icon: TrendingUp,
		title: "Track progress",
		description: "Monitor your health improvements and stay motivated.",
	},
];

export function AppFeaturesSection() {
	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-4">
				<h2 className="text-2xl font-bold text-blue-900 text-center mb-10">
					App features
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{features.map((feature, idx) => {
						const Icon = feature.icon;
						return (
							<div
								key={feature.title}
								className="relative rounded-2xl bg-white p-6 shadow-lg border border-transparent hover:border-blue-300 transition group"
							>
								<div
									className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-400 via-blue-200 to-blue-100 opacity-70 blur-sm z-0 group-hover:opacity-90"
									style={{ filter: "blur(6px)" }}
								/>
								<div className="relative z-10 flex flex-col items-center text-center">
									<div className="bg-gradient-to-br from-blue-500 to-blue-300 text-white rounded-full p-3 mb-4 shadow-md">
										<Icon className="w-7 h-7" />
									</div>
									<h3 className="text-lg font-semibold text-blue-900 mb-2">
										{feature.title}
									</h3>
									<p className="text-gray-600 text-sm">{feature.description}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
