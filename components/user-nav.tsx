"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
	first_name: string | null;
	last_name: string | null;
}

export const UserNav = () => {
	const [user, setUser] = useState<SupabaseUser | null>(null);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [profileLoading, setProfileLoading] = useState(false);

	useEffect(() => {
		console.log("[UserNav] Component mounted, initializing...");
		const supabase = createClient();
		let isInitialLoad = true;

		// Get initial user
		const getUser = async () => {
			try {
				console.log("[UserNav] Fetching initial user...");
				const {
					data: { user },
					error: authError,
				} = await supabase.auth.getUser();

				if (authError) {
					console.error("[UserNav] Auth error:", authError);
				}

				console.log(
					"[UserNav] User fetched:",
					user ? "Authenticated" : "Not authenticated"
				);
				setUser(user);

				// Fetch user profile if user exists
				if (user) {
					console.log("[UserNav] User ID:", user.id);
					setProfileLoading(true);
					try {
						console.log("[UserNav] Fetching user profile from database...");
						const { data, error } = await supabase
							.from("users")
							.select("first_name, last_name")
							.eq("supabase_id", user.id)
							.single();

						if (error) {
							console.error("[UserNav] Profile fetch error:", error);
						} else {
							console.log("[UserNav] Profile fetched:", data);
							setUserProfile(data);
						}
					} catch (profileError) {
						console.error("[UserNav] Profile fetch exception:", profileError);
					} finally {
						setProfileLoading(false);
					}
				}
			} catch (error) {
				console.error("[UserNav] GetUser exception:", error);
			} finally {
				console.log("[UserNav] Setting loading to false");
				setLoading(false);
				isInitialLoad = false;
			}
		};

		getUser();

		// Listen for auth changes
		console.log("[UserNav] Setting up auth state change listener");
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log(
				"[UserNav] Auth state changed:",
				event,
				session?.user ? "User present" : "No user"
			);

			// Skip events during initial load since we handle that in getUser()
			if (isInitialLoad) {
				console.log("[UserNav] Skipping event during initial load:", event);
				return;
			}

			setUser(session?.user || null);

			if (session?.user) {
				setProfileLoading(true);
				try {
					console.log("[UserNav] Fetching profile for user:", session.user.id);
					const { data, error } = await supabase
						.from("users")
						.select("first_name, last_name")
						.eq("supabase_id", session.user.id)
						.single();

					if (error) {
						console.error(
							"[UserNav] Profile fetch error (auth change):",
							error
						);
					} else {
						console.log("[UserNav] Profile fetched (auth change):", data);
						setUserProfile(data);
					}
				} catch (profileError) {
					console.error(
						"[UserNav] Profile fetch exception (auth change):",
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
			console.log("[UserNav] Component unmounting, cleaning up subscription");
			subscription.unsubscribe();
		};
	}, []);

	const handleSignOut = async () => {
		await signOut();
	};

	console.log("[UserNav] Render state:", {
		loading,
		user: !!user,
		profileLoading,
	});

	if (loading) {
		console.log("[UserNav] Rendering loading state");
		// Loading state - show avatar icon, allow it to be clickable
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 rounded-full">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="bg-gray-200">
								<UserCircle className="h-5 w-5 text-gray-500" />
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<div className="flex items-center justify-center p-4">
						<div className="animate-pulse text-sm text-muted-foreground">
							Loading...
						</div>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	if (!user) {
		console.log(
			"[UserNav] Rendering unauthenticated state (login/register buttons)"
		);
		// Show login/register buttons when not authenticated
		return (
			<div className="flex items-center space-x-2">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/login">Log In</Link>
				</Button>
				<Button size="sm" asChild>
					<Link href="/register">Create an Account</Link>
				</Button>
			</div>
		);
	}

	// Show user menu when authenticated
	const fullName =
		userProfile?.first_name && userProfile?.last_name
			? `${userProfile.first_name} ${userProfile.last_name}`
			: null;

	console.log("[UserNav] Rendering authenticated state with user:", {
		email: user.email,
		fullName,
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="bg-blue-600 text-white">
							<UserCircle className="h-5 w-5" />
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<div className="flex items-center justify-start gap-2 p-2">
					<div className="flex flex-col space-y-1 leading-none">
						{profileLoading ? (
							<div className="animate-pulse">
								<div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
								<div className="h-3 bg-gray-100 rounded w-24"></div>
							</div>
						) : (
							<>
								{fullName && <p className="font-medium text-sm">{fullName}</p>}
								<p
									className={
										fullName
											? "text-xs text-muted-foreground"
											: "font-medium text-sm"
									}
								>
									{user.email}
								</p>
							</>
						)}
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/dashboard" className="flex items-center">
						<User className="mr-2 h-4 w-4" />
						<span>Dashboard</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="flex items-center">
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					<span>Sign out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
