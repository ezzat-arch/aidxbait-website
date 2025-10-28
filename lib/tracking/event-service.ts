/**
 * Event Tracking Service
 * Centralized service for tracking user events
 */

import { sessionService } from "./session-service";
import type { CartItem } from "@/lib/store-types";

const EVENTS_API_URL = "/api/tracking/events";
const CART_SNAPSHOT_API_URL = "/api/tracking/cart-snapshot";
const BATCH_INTERVAL = 5000; // Send events every 5 seconds
const MAX_BATCH_SIZE = 50;

type CartEventType =
	| "add"
	| "remove"
	| "update_quantity"
	| "clear"
	| "open"
	| "close";

type CheckoutEventType =
	| "started"
	| "address_selected"
	| "payment_method_selected"
	| "order_submitted"
	| "payment_initiated"
	| "payment_completed"
	| "payment_failed"
	| "abandoned";

interface ProductViewEvent {
	type: "product_view";
	product_id: number;
	referrer_url?: string;
	duration_seconds?: number;
}

interface CartEvent {
	type: "cart_event";
	event_type: CartEventType;
	product_id?: number;
	quantity?: number;
	rental_weeks?: number;
	previous_quantity?: number;
	cart_value_at_event?: number;
	cart_item_count?: number;
}

interface CheckoutEvent {
	type: "checkout_event";
	event_type: CheckoutEventType;
	order_id?: number;
	cart_value?: number;
	cart_item_count?: number;
	payment_method?: string;
	failure_reason?: string;
}

type TrackingEvent = ProductViewEvent | CartEvent | CheckoutEvent;

class EventService {
	private eventQueue: TrackingEvent[] = [];
	private batchInterval: NodeJS.Timeout | null = null;
	private isInitialized: boolean = false;

	/**
	 * Initialize event service
	 */
	initialize(): void {
		if (this.isInitialized) return;

		// Start batch sending
		this.startBatchSending();

		// Send remaining events on page unload
		this.setupBeforeUnloadListener();

		this.isInitialized = true;
		console.log("[EventService] Initialized");
	}

	/**
	 * Track product view
	 */
	trackProductView(productId: number, referrer?: string): void {
		const event: ProductViewEvent = {
			type: "product_view",
			product_id: productId,
			referrer_url: referrer || document.referrer || undefined,
		};

		this.queueEvent(event);
	}

	/**
	 * Track product view duration (call on page exit)
	 */
	trackProductViewDuration(productId: number, durationSeconds: number): void {
		// Send immediately using sendBeacon (more reliable on page exit)
		this.sendProductViewDuration(productId, durationSeconds);
	}

	/**
	 * Track cart event
	 */
	trackCartEvent(
		eventType: CartEventType,
		options?: {
			productId?: number;
			quantity?: number;
			rentalWeeks?: number;
			previousQuantity?: number;
			cartValue?: number;
			cartItemCount?: number;
		}
	): void {
		const event: CartEvent = {
			type: "cart_event",
			event_type: eventType,
			product_id: options?.productId,
			quantity: options?.quantity,
			rental_weeks: options?.rentalWeeks,
			previous_quantity: options?.previousQuantity,
			cart_value_at_event: options?.cartValue,
			cart_item_count: options?.cartItemCount,
		};

		this.queueEvent(event);
	}

	/**
	 * Track checkout event
	 */
	trackCheckoutEvent(
		eventType: CheckoutEventType,
		options?: {
			orderId?: number;
			cartValue?: number;
			cartItemCount?: number;
			paymentMethod?: string;
			failureReason?: string;
		}
	): void {
		const event: CheckoutEvent = {
			type: "checkout_event",
			event_type: eventType,
			order_id: options?.orderId,
			cart_value: options?.cartValue,
			cart_item_count: options?.cartItemCount,
			payment_method: options?.paymentMethod,
			failure_reason: options?.failureReason,
		};

		this.queueEvent(event);
	}

	/**
	 * Create cart snapshot (for abandonment tracking)
	 */
	async createCartSnapshot(
		cartItems: CartItem[],
		totalValue: number
	): Promise<void> {
		const sessionId = sessionService.getSessionId();
		const userId = sessionService.getUserId();

		if (!sessionId) {
			console.warn("[EventService] No session ID, cannot create cart snapshot");
			return;
		}

		const snapshotData = {
			session_id: sessionId,
			user_id: userId,
			cart_items: cartItems.map((item) => ({
				product_id: item.product.id,
				quantity: item.quantity,
				rental_weeks: item.rental_weeks,
				price: item.product.discounted_price || item.product.price,
			})),
			total_value: totalValue,
			item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
		};

		try {
			const response = await fetch(CART_SNAPSHOT_API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(snapshotData),
			});

			if (!response.ok) {
				console.error("[EventService] Failed to create cart snapshot");
			}
		} catch (error) {
			console.error("[EventService] Error creating cart snapshot:", error);
		}
	}

	/**
	 * Queue event for batch sending
	 */
	private queueEvent(event: TrackingEvent): void {
		this.eventQueue.push(event);

		// Send immediately if batch is full
		if (this.eventQueue.length >= MAX_BATCH_SIZE) {
			this.sendBatch();
		}
	}

	/**
	 * Start batch sending interval
	 */
	private startBatchSending(): void {
		if (this.batchInterval) return;

		this.batchInterval = setInterval(() => {
			if (this.eventQueue.length > 0) {
				this.sendBatch();
			}
		}, BATCH_INTERVAL);
	}

	/**
	 * Send batched events to server
	 */
	private async sendBatch(): Promise<void> {
		if (this.eventQueue.length === 0) return;

		const sessionId = sessionService.getSessionId();
		const userId = sessionService.getUserId();

		if (!sessionId) {
			console.warn("[EventService] No session ID, cannot send events");
			return;
		}

		const batch = [...this.eventQueue];
		this.eventQueue = []; // Clear queue

		try {
			const response = await fetch(EVENTS_API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					session_id: sessionId,
					user_id: userId,
					events: batch,
				}),
			});

			if (!response.ok) {
				console.error("[EventService] Failed to send events");
				// Re-queue failed events (optional)
				// this.eventQueue.push(...batch);
			}
		} catch (error) {
			console.error("[EventService] Error sending events:", error);
		}
	}

	/**
	 * Send product view duration immediately using sendBeacon
	 */
	private sendProductViewDuration(
		productId: number,
		durationSeconds: number
	): void {
		const sessionId = sessionService.getSessionId();
		const userId = sessionService.getUserId();

		if (!sessionId) return;

		const data = JSON.stringify({
			session_id: sessionId,
			user_id: userId,
			events: [
				{
					type: "product_view_duration",
					product_id: productId,
					duration_seconds: durationSeconds,
				},
			],
		});

		if (navigator.sendBeacon) {
			const blob = new Blob([data], { type: "application/json" });
			navigator.sendBeacon(EVENTS_API_URL, blob);
		}
	}

	/**
	 * Setup before unload listener to send remaining events
	 */
	private setupBeforeUnloadListener(): void {
		if (typeof window === "undefined") return;

		window.addEventListener("beforeunload", () => {
			if (this.eventQueue.length > 0) {
				const sessionId = sessionService.getSessionId();
				const userId = sessionService.getUserId();

				if (!sessionId) return;

				const data = JSON.stringify({
					session_id: sessionId,
					user_id: userId,
					events: this.eventQueue,
				});

				if (navigator.sendBeacon) {
					const blob = new Blob([data], { type: "application/json" });
					navigator.sendBeacon(EVENTS_API_URL, blob);
				}

				this.eventQueue = [];
			}
		});
	}

	/**
	 * Flush events immediately (useful before navigation)
	 */
	async flush(): Promise<void> {
		if (this.eventQueue.length > 0) {
			await this.sendBatch();
		}
	}
}

// Singleton instance
export const eventService = new EventService();

