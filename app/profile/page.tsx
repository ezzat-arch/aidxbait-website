"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
	const { userProfile } = useAuth();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">
					Welcome back, {userProfile?.first_name}!
				</h1>
				<p className="text-muted-foreground">
					Manage your orders and account settings
				</p>
			</div>

			{/* Quick Links */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							My Orders
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							View your order history and track your shipments
						</p>
						<Button asChild className="w-full">
							<Link href="/profile/my-orders">View Orders</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5" />
							My Addresses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Manage your shipping and billing addresses
						</p>
						<Button asChild className="w-full" variant="outline">
							<Link href="/profile/addresses">Manage Addresses</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Account Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Account Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Full Name
							</p>
							<p className="text-base">
								{userProfile?.first_name} {userProfile?.last_name}
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Email</p>
							<p className="text-base">{userProfile?.email || "Not set"}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">Phone</p>
							<p className="text-base">{userProfile?.phone_number}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Account Type
							</p>
							<p className="text-base capitalize">{userProfile?.user_type}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
