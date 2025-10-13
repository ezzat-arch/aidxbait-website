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
		console.log("[AuthContext] Provider mounted, initializing...");
		const supabase = createClient();
		let isInitialLoad = true;

		// Get initial user
		const getUser = async () => {
			try {
				console.log("[AuthContext] Fetching initial user...");
				const {
					data: { user },
					error: authError,
				} = await supabase.auth.getUser();

				if (authError) {
					console.error("[AuthContext] Auth error:", authError);
				}

				console.log(
					"[AuthContext] User fetched:",
					user ? "Authenticated" : "Not authenticated"
				);
				setUser(user);

				// Fetch user profile if user exists
				if (user) {
					console.log("[AuthContext] User ID:", user.id);
					setProfileLoading(true);
					try {
						console.log("[AuthContext] Fetching user profile from database...");
						const { data, error } = await supabase
							.from("users")
							.select(
								"id, phone_number, email, first_name, last_name, user_type, image_url"
							)
							.eq("supabase_id", user.id)
							.single();

						if (error) {
							console.error("[AuthContext] Profile fetch error:", error);
						} else {
							console.log("[AuthContext] Profile fetched:", data);
							setUserProfile(data);
						}
					} catch (profileError) {
						console.error(
							"[AuthContext] Profile fetch exception:",
							profileError
						);
					} finally {
						setProfileLoading(false);
					}
				}
			} catch (error) {
				console.error("[AuthContext] GetUser exception:", error);
			} finally {
				console.log("[AuthContext] Setting loading to false");
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
							"id, phone_number, email, first_name, last_name, user_type, image_url"
						)
						.eq("supabase_id", session.user.id)
						.single();

					if (error) {
						console.error(
							"[AuthContext] Profile fetch error (auth change):",
							error
						);
					} else {
						console.log("[AuthContext] Profile fetched (auth change):", data);
						setUserProfile(data);
					}
				} catch (profileError) {
					console.error(
						"[AuthContext] Profile fetch exception (auth change):",
						profileError
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

	console.log("[AuthContext] Provider render state:", {
		loading,
		user: !!user,
		profileLoading,
	});

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
