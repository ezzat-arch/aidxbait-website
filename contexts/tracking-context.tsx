"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { sessionService } from "@/lib/tracking/session-service";
import { eventService } from "@/lib/tracking/event-service";
import { useAuth } from "@/contexts/auth-context";

interface TrackingContextType {
	isInitialized: boolean;
}

const TrackingContext = createContext<TrackingContextType>({
	isInitialized: false,
});

interface TrackingProviderProps {
	children: ReactNode;
}

export function TrackingProvider({ children }: TrackingProviderProps) {
	const { userProfile, loading: authLoading } = useAuth();
	const [isInitialized, setIsInitialized] = React.useState(false);

	useEffect(() => {
		if (authLoading) return;

		// Initialize tracking services
		const initializeTracking = async () => {
			try {
				// Initialize session
				await sessionService.initialize(userProfile?.id || null);

				// Initialize event service
				eventService.initialize();

				setIsInitialized(true);
				console.log("[TrackingProvider] Initialized");
			} catch (error) {
				console.error("[TrackingProvider] Initialization failed:", error);
			}
		};

		initializeTracking();
	}, [authLoading, userProfile?.id]);

	// Update session when user logs in/out
	useEffect(() => {
		if (!isInitialized || authLoading) return;

		if (userProfile?.id) {
			sessionService.linkUser(userProfile.id);
		} else {
			sessionService.clearSession();
		}
	}, [userProfile?.id, isInitialized, authLoading]);

	return (
		<TrackingContext.Provider value={{ isInitialized }}>
			{children}
		</TrackingContext.Provider>
	);
}

export function useTracking() {
	const context = useContext(TrackingContext);
	if (context === undefined) {
		throw new Error("useTracking must be used within a TrackingProvider");
	}
	return context;
}

