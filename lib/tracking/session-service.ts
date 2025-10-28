/**
 * Session Management Service
 * Handles user session tracking for analytics
 */

import { v4 as uuidv4 } from "uuid";

const SESSION_STORAGE_KEY = "aidxbait_session_id";
const SESSION_HEARTBEAT_INTERVAL = 30000; // 30 seconds
const SESSION_INIT_URL = "/api/tracking/session";

interface SessionData {
	sessionId: string;
	sessionUuid: string | null; // DB UUID
	userId: number | null;
	startedAt: string;
	lastActivityAt: string;
}

class SessionService {
	private sessionId: string | null = null;
	private sessionUuid: string | null = null;
	private userId: number | null = null;
	private heartbeatInterval: NodeJS.Timeout | null = null;
	private isInitialized: boolean = false;

	/**
	 * Initialize session on app load
	 */
	async initialize(userId?: number | null): Promise<void> {
		if (this.isInitialized) {
			// If user changed, update session
			if (userId && userId !== this.userId) {
				await this.linkUser(userId);
			}
			return;
		}

		// Get or create session ID
		this.sessionId = this.getOrCreateSessionId();
		this.userId = userId || null;

		// Initialize session on server
		await this.initializeSessionOnServer();

		// Start heartbeat
		this.startHeartbeat();

		// Track page visibility changes
		this.setupVisibilityListener();

		// Track before unload
		this.setupBeforeUnloadListener();

		this.isInitialized = true;

		console.log(
			"[SessionService] Initialized:",
			this.sessionId,
			"User:",
			this.userId
		);
	}

	/**
	 * Get or create session ID from localStorage
	 */
	private getOrCreateSessionId(): string {
		if (typeof window === "undefined") return uuidv4();

		let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

		if (!sessionId) {
			sessionId = uuidv4();
			localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
		}

		return sessionId;
	}

	/**
	 * Initialize or update session on server
	 */
	private async initializeSessionOnServer(): Promise<void> {
		if (!this.sessionId) return;

		try {
			const response = await fetch(SESSION_INIT_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					session_id: this.sessionId,
					user_id: this.userId,
					user_agent: navigator.userAgent,
					referrer_url: document.referrer || null,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				this.sessionUuid = data.session_uuid;
			}
		} catch (error) {
			console.error("[SessionService] Failed to initialize session:", error);
		}
	}

	/**
	 * Update last activity timestamp
	 */
	private async updateActivity(): Promise<void> {
		if (!this.sessionId) return;

		try {
			// Use sendBeacon for reliability (doesn't block page unload)
			const data = JSON.stringify({
				session_id: this.sessionId,
				action: "heartbeat",
			});

			if (navigator.sendBeacon) {
				const blob = new Blob([data], { type: "application/json" });
				navigator.sendBeacon(SESSION_INIT_URL, blob);
			} else {
				// Fallback to fetch
				await fetch(SESSION_INIT_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: data,
					keepalive: true,
				});
			}
		} catch (error) {
			console.error("[SessionService] Failed to update activity:", error);
		}
	}

	/**
	 * Start heartbeat to update activity
	 */
	private startHeartbeat(): void {
		if (this.heartbeatInterval) return;

		this.heartbeatInterval = setInterval(() => {
			this.updateActivity();
		}, SESSION_HEARTBEAT_INTERVAL);
	}

	/**
	 * Stop heartbeat
	 */
	private stopHeartbeat(): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	/**
	 * Track page visibility changes
	 */
	private setupVisibilityListener(): void {
		if (typeof document === "undefined") return;

		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				this.stopHeartbeat();
			} else {
				this.updateActivity();
				this.startHeartbeat();
			}
		});
	}

	/**
	 * Track before page unload
	 */
	private setupBeforeUnloadListener(): void {
		if (typeof window === "undefined") return;

		window.addEventListener("beforeunload", () => {
			this.updateActivity();
		});
	}

	/**
	 * Link session to authenticated user
	 */
	async linkUser(userId: number): Promise<void> {
		if (!this.sessionId) return;

		this.userId = userId;

		try {
			await fetch(SESSION_INIT_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					session_id: this.sessionId,
					user_id: userId,
					action: "link_user",
				}),
			});

			console.log("[SessionService] Linked user:", userId);
		} catch (error) {
			console.error("[SessionService] Failed to link user:", error);
		}
	}

	/**
	 * Get current session ID
	 */
	getSessionId(): string | null {
		return this.sessionId;
	}

	/**
	 * Get current session UUID (DB ID)
	 */
	getSessionUuid(): string | null {
		return this.sessionUuid;
	}

	/**
	 * Get current user ID
	 */
	getUserId(): number | null {
		return this.userId;
	}

	/**
	 * Clear session (for logout)
	 */
	clearSession(): void {
		this.stopHeartbeat();
		this.userId = null;
		// Keep session_id for guest tracking
		console.log("[SessionService] User logged out, session continues as guest");
	}
}

// Singleton instance
export const sessionService = new SessionService();

