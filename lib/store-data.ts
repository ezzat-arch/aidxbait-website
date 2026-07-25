import { Product } from "./store-types";

// labelKey resolves against the "lib.store.data.label" translation namespace
export const JOINT_CATEGORIES = [
	{ value: "all", labelKey: "all_joints", icon: "🔄" },
	{ value: "neck", labelKey: "neck_support", icon: "/icons/joints/neck.png" },
	{
		value: "shoulder",
		labelKey: "shoulder_support",
		icon: "/icons/joints/shoulder.png",
	},
	{ value: "elbow", labelKey: "elbow_support", icon: "/icons/joints/elbow.png" },
	{ value: "wrist", labelKey: "wrist_support", icon: "/icons/joints/wrist.png" },
	{ value: "back", labelKey: "back_support", icon: "/icons/joints/back.png" },
	{ value: "thigh", labelKey: "thigh_support", icon: "/icons/joints/thigh.png" },
	{ value: "knee", labelKey: "knee_support", icon: "/icons/joints/knee.png" },
	{ value: "ankle", labelKey: "ankle_support", icon: "/icons/joints/ankle.png" },
	{
		value: "abdomen",
		labelKey: "abdomen_support",
		icon: "/icons/joints/abdomen.png",
	},
	{ value: "calf", labelKey: "calf_support", icon: "/icons/joints/calf.png" },
	{ value: "chest", labelKey: "chest_support", icon: "/icons/joints/chest.png" },
];

export const PRODUCT_CATEGORIES = [
	{ value: "all", labelKey: "all_categories" },
	{ value: "Braces & Supports", labelKey: "braces_supports" },
	{ value: "Slings & Immobilizers", labelKey: "slings_immobilizers" },
	{ value: "Back Support", labelKey: "back_support" },
	{ value: "Compression Wear", labelKey: "compression_wear" },
	{ value: "Sports Medicine", labelKey: "sports_medicine" },
	{ value: "Wrist Support", labelKey: "wrist_support" },
	{ value: "Neck Support", labelKey: "neck_support" },
	{ value: "Exercise Equipment", labelKey: "exercise_equipment" },
	{ value: "Therapy Equipment", labelKey: "therapy_equipment" },
];
