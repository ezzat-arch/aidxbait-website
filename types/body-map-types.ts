import { Joint } from "@/lib/store-types";

/**
 * Represents a coordinate position on the body map
 * Uses percentage-based positioning for responsive design
 */
export interface BodyPartCoordinate {
	/** X position as percentage of container width (0-100) */
	x: number;
	/** Y position as percentage of container height (0-100) */
	y: number;
}

/**
 * Represents a clickable body part/joint on the interactive map
 */
export interface BodyPart {
	/** Unique identifier for the body part */
	id: string;
	/** Translation key for the body part label */
	translationKey: string;
	/** Associated joint type from the store system */
	joint: Joint;
	/** Position coordinates on the body map */
	coordinates: BodyPartCoordinate;
	/** Optional: Side indicator for paired body parts (left/right) */
	side?: "left" | "right";
	/** Optional: Description for accessibility */
	description?: string;
}

/**
 * Configuration for the entire body map
 * Contains all body parts and their positions
 */
export interface BodyMapConfig {
	/** Array of all body parts to display on the map */
	bodyParts: BodyPart[];
	/** Default image dimensions for coordinate calculations */
	imageAspectRatio: number;
}

/**
 * State management for body map interactions
 */
export interface BodyMapState {
	/** Currently selected body part ID */
	selectedPartId: string | null;
	/** Currently hovered body part ID */
	hoveredPartId: string | null;
}

/**
 * Props for body map interaction callbacks
 */
export interface BodyMapCallbacks {
	/** Called when a body part is clicked */
	onPartClick?: (bodyPart: BodyPart) => void;
	/** Called when a body part is hovered */
	onPartHover?: (bodyPart: BodyPart | null) => void;
	/** Called when a body part is selected (for keyboard navigation) */
	onPartSelect?: (bodyPart: BodyPart) => void;
}

