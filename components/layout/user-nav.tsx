"use client";

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
import { LogOut, Settings, UserCircle, Package, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

export const UserNav = () => {
	const { user, userProfile, loading, profileLoading, signOut } = useAuth();
	const tUser = useTranslations("layout.user.text");
	const tHero = useTranslations("sections.hero.text");

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
							{tUser("loading")}
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
			<div className="flex flex-col items-center gap-1">
				<Button size="sm" asChild>
					<Link href="/register">{tUser("create_an_account")}</Link>
				</Button>
				<Link
					href="/login"
					className="text-xs text-muted-foreground hover:text-primary transition-colors"
				>
					{tHero("already_have_an_account")}{" "}
					<span className="underline font-medium">{tHero("log_in")}</span>
				</Link>
			</div>
		);
	}

	// Show user menu when authenticated
	const fullName =
		userProfile?.first_name && userProfile?.last_name
			? `${userProfile.first_name} ${userProfile.last_name}`
			: null;

	const firstName = userProfile?.first_name || "User";

	console.log("[UserNav] Rendering authenticated state with user:", {
		email: user.email,
		fullName,
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative px-4 py-2 h-auto">
					<span className="text-md font-medium">
						{tUser("hello_name", { name: firstName })}
					</span>
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
					<Link href="/profile/my-orders" className="flex items-center">
						<Package className="mr-2 h-4 w-4" />
						<span>{tUser("my_orders")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/profile/addresses" className="flex items-center">
						<MapPin className="mr-2 h-4 w-4" />
						<span>{tUser("my_addresses")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/settings" className="flex items-center">
						<Settings className="mr-2 h-4 w-4" />
						<span>{tUser("settings")}</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={signOut} className="cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					<span>{tUser("sign_out")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
