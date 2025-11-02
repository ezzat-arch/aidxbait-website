"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
	id: number;
	patient_id: number;
	phone_number: string;
	email: string | null;
	first_name: string | null;
	last_name: string | null;
	user_type: string;
	image_url: string | null;
}

interface AuthContextType {
	user: SupabaseUser | null;
	userProfile: UserProfile | null;
	loading: boolean;
	profileLoading: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<SupabaseUser | null>(null);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [profileLoading, setProfileLoading] = useState(false);

	useEffect(() => {
		console.log("[AUTH-DEBUG] Provider mounted, initializing at", new Date().toISOString());
		console.log("[AUTH-DEBUG] Initial states:", { loading: true, profileLoading: false });
		const supabase = createClient();
		let isInitialLoad = true;

		// Get initial user
		const getUser = async () => {
			const startTime = Date.now();
			try {
				console.log("[AUTH-DEBUG] Fetching initial user at", new Date().toISOString());
				const {
					data: { user },
					error: authError,
				} = await supabase.auth.getUser();

				if (authError) {
					console.error("[AUTH-DEBUG] Auth error:", authError);
				}

				const authDuration = Date.now() - startTime;
				console.log("[AUTH-DEBUG] User fetched:", {
					authenticated: !!user,
					durationMs: authDuration,
					timestamp: new Date().toISOString(),
				});
				setUser(user);

				// Fetch user profile if user exists
				if (user) {
					console.log("[AUTH-DEBUG] User authenticated, fetching profile. User ID:", user.id);
					console.log("[AUTH-DEBUG] Setting profileLoading to true");
					setProfileLoading(true);
					try {
						console.log("[AUTH-DEBUG] Fetching user profile from database...");
						const profileStartTime = Date.now();
						
						const { data, error } = await supabase
							.from("users")
							.select(
								"id, phone_number, email, first_name, last_name, user_type, image_url, patients(id)"
							)
							.eq("supabase_id", user.id)
							.maybeSingle();

						const profileDuration = Date.now() - profileStartTime;
						
						if (error) {
							console.error("[AUTH-DEBUG] Profile fetch error:", {
								error: JSON.stringify(error, null, 2),
								durationMs: profileDuration,
								timestamp: new Date().toISOString(),
							});
						} else if (!data) {
							console.warn("[AUTH-DEBUG] No profile found for user:", {
								userId: user.id,
								durationMs: profileDuration,
								timestamp: new Date().toISOString(),
							});
						} else {
							const patientId = (data as any).patients?.id || null;
							console.log("[AUTH-DEBUG] Profile fetched successfully:", {
								userId: data.id,
								patientId,
								userType: data.user_type,
								durationMs: profileDuration,
								timestamp: new Date().toISOString(),
							});
							// Extract patient_id from the nested patients object
							const profileData = {
								...data,
								patient_id: patientId,
							};
							delete (profileData as any).patients;
							setUserProfile(profileData);
						}
					} catch (profileError) {
						console.error("[AUTH-DEBUG] Profile fetch exception:", {
							error: JSON.stringify(profileError, null, 2),
							timestamp: new Date().toISOString(),
						});
					} finally {
						console.log("[AUTH-DEBUG] Setting profileLoading to false");
						setProfileLoading(false);
					}
				}
			} catch (error) {
				console.error("[AUTH-DEBUG] GetUser exception:", {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					timestamp: new Date().toISOString(),
				});
			} finally {
				const totalDuration = Date.now() - startTime;
				console.log("[AUTH-DEBUG] Auth initialization complete:", {
					loading: false,
					totalDurationMs: totalDuration,
					timestamp: new Date().toISOString(),
				});
				console.log("[AUTH-DEBUG] Setting loading to false");
				setLoading(false);
				isInitialLoad = false;
			}
		};

		getUser();

		// Listen for auth changes
		console.log("[AuthContext] Setting up auth state change listener");
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(
				"[AuthContext] Auth state changed:",
				event,
				session?.user ? "User present" : "No user"
			);

			// Skip events during initial load since we handle that in getUser()
			if (isInitialLoad) {
				console.log("[AuthContext] Skipping event during initial load:", event);
				return;
			}

			setUser(session?.user || null);

			if (session?.user) {
				setProfileLoading(true);
				try {
					console.log(
						"[AuthContext] Fetching profile for user:",
						session.user.id
					);
					const { data, error } = await supabase
						.from("users")
						.select(
							"id, phone_number, email, first_name, last_name, user_type, image_url, patients(id)"
						)
						.eq("supabase_id", session.user.id)
						.maybeSingle();

					if (error) {
						console.error(
							"[AuthContext] Profile fetch error (auth change):",
							JSON.stringify(error, null, 2)
						);
					} else if (!data) {
						console.warn(
							"[AuthContext] No profile found for user (auth change). User may need to complete registration."
						);
					} else {
						console.log("[AuthContext] Profile fetched (auth change):", data);
						// Extract patient_id from the nested patients object
						const profileData = {
							...data,
							patient_id: (data as any).patients?.id || null,
						};
						delete (profileData as any).patients;
						setUserProfile(profileData);
					}
				} catch (profileError) {
					console.error(
						"[AuthContext] Profile fetch exception (auth change):",
						JSON.stringify(profileError, null, 2)
					);
				} finally {
					setProfileLoading(false);
				}
			} else {
				setUserProfile(null);
			}
		});

		return () => {
			console.log(
				"[AuthContext] Provider unmounting, cleaning up subscription"
			);
			subscription.unsubscribe();
		};
	}, []);

	const handleSignOut = async () => {
		await signOut();
	};

	// DEBUG: Log state on every render
	useEffect(() => {
		console.log("[AUTH-DEBUG] State update:", {
			loading,
			hasUser: !!user,
			profileLoading,
			hasUserProfile: !!userProfile,
			patientId: userProfile?.patient_id,
			timestamp: new Date().toISOString(),
		});
	}, [loading, user, profileLoading, userProfile]);

	return (
		<AuthContext.Provider
			value={{
				user,
				userProfile,
				loading,
				profileLoading,
				signOut: handleSignOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
