import { Product } from "./store-types";

export const JOINT_CATEGORIES = [
	{ value: "all", label: "All Joints", icon: "🔄" },
	{ value: "neck", label: "Neck Support", icon: "/icons/joints/neck.png" },
	{
		value: "shoulder",
		label: "Shoulder Support",
		icon: "/icons/joints/shoulder.png",
	},
	{ value: "elbow", label: "Elbow Support", icon: "/icons/joints/elbow.png" },
	{ value: "wrist", label: "Wrist Support", icon: "/icons/joints/wrist.png" },
	{ value: "back", label: "Back Support", icon: "/icons/joints/back.png" },
	{ value: "thigh", label: "Thigh Support", icon: "/icons/joints/thigh.png" },
	{ value: "knee", label: "Knee Support", icon: "/icons/joints/knee.png" },
	{ value: "ankle", label: "Ankle Support", icon: "/icons/joints/ankle.png" },
	{
		value: "abdomen",
		label: "Abdomen Support",
		icon: "/icons/joints/abdomen.png",
	},
	{ value: "calf", label: "Calf Support", icon: "/icons/joints/calf.png" },
	{ value: "chest", label: "Chest Support", icon: "/icons/joints/chest.png" },
];

export const PRODUCT_CATEGORIES = [
	{ value: "all", label: "All Categories" },
	{ value: "Braces & Supports", label: "Braces & Supports" },
	{ value: "Slings & Immobilizers", label: "Slings & Immobilizers" },
	{ value: "Back Support", label: "Back Support" },
	{ value: "Compression Wear", label: "Compression Wear" },
	{ value: "Sports Medicine", label: "Sports Medicine" },
	{ value: "Wrist Support", label: "Wrist Support" },
	{ value: "Neck Support", label: "Neck Support" },
	{ value: "Exercise Equipment", label: "Exercise Equipment" },
	{ value: "Therapy Equipment", label: "Therapy Equipment" },
];
