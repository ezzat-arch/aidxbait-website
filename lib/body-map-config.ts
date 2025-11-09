import { BodyMapConfig, BodyPart } from "@/types/body-map-types";

/**
 * Body map configuration for the runner image
 * Coordinates are percentage-based (0-100) for responsive design
 * The runner image shows a side view facing right
 */

const bodyParts: BodyPart[] = [
	{
		id: "neck",
		translationKey: "lib.store.data.label.neck",
		joint: "neck",
		coordinates: { x: 61, y: 34 },
		description: "Neck and cervical spine area",
	},
	{
		id: "shoulder",
		translationKey: "lib.store.data.label.shoulder",
		joint: "shoulder",
		coordinates: { x: 53, y: 33 },
		description: "Shoulder joint",
	},
	{
		id: "chest",
		translationKey: "lib.store.data.label.chest",
		joint: "chest",
		coordinates: { x: 58, y: 40 },
		description: "Chest and pectoral area",
	},
	{
		id: "elbow",
		translationKey: "lib.store.data.label.elbow",
		joint: "elbow",
		coordinates: { x: 68, y: 47.5 },
		description: "Elbow joint",
	},
	{
		id: "abdomen",
		translationKey: "lib.store.data.label.abdomen",
		joint: "abdomen",
		coordinates: { x: 50, y: 46 },
		description: "Abdominal and core area",
	},
	{
		id: "back",
		translationKey: "lib.store.data.label.back",
		joint: "back",
		coordinates: { x: 45, y: 42 },
		description: "Lower back and lumbar area",
	},
	{
		id: "wrist",
		translationKey: "lib.store.data.label.wrist",
		joint: "wrist",
		coordinates: { x: 30, y: 36 },
		description: "Wrist joint",
	},
	{
		id: "thigh",
		translationKey: "lib.store.data.label.thigh",
		joint: "thigh",
		coordinates: { x: 42, y: 49 },
		description: "Thigh area",
	},
	{
		id: "knee",
		translationKey: "lib.store.data.label.knee",
		joint: "knee",
		coordinates: { x: 61, y: 54 },
		description: "Knee joint",
	},
	{
		id: "calf",
		translationKey: "lib.store.data.label.calf",
		joint: "calf",
		coordinates: { x: 24, y: 59 },
		description: "Calf muscle area",
	},
	{
		id: "ankle",
		translationKey: "lib.store.data.label.ankle",
		joint: "ankle",
		coordinates: { x: 18, y: 64 },
		description: "Ankle joint",
	},
];

/**
 * Complete body map configuration
 * Image aspect ratio based on the runner image dimensions
 */
export const bodyMapConfig: BodyMapConfig = {
	bodyParts,
	imageAspectRatio: 3 / 4, // Width:Height ratio for the runner image
};

/**
 * Helper function to get body parts by joint type
 */
export function getBodyPartsByJoint(jointType: string): BodyPart[] {
	return bodyParts.filter((part) => part.joint === jointType);
}

/**
 * Helper function to get a body part by ID
 */
export function getBodyPartById(id: string): BodyPart | undefined {
	return bodyParts.find((part) => part.id === id);
}

/**
 * Helper function to get all unique joint types
 */
export function getAllJointTypes(): string[] {
	const uniqueJoints = new Set(bodyParts.map((part) => part.joint));
	return Array.from(uniqueJoints);
}
