"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
	const { userProfile } = useAuth();
	const t = useTranslations("profile.page.text");

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">
					{t("welcome_back", { name: userProfile?.first_name || "" })}
				</h1>
				<p className="text-muted-foreground">
					{t("manage_orders_and_settings")}
				</p>
			</div>

			{/* Quick Links */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							{t("my_orders")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							{t("my_orders_description")}
						</p>
						<Button asChild className="w-full">
							<Link href="/profile/my-orders">{t("view_orders")}</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5" />
							{t("my_addresses")}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							{t("my_addresses_description")}
						</p>
						<Button asChild className="w-full" variant="outline">
							<Link href="/profile/addresses">{t("manage_addresses")}</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Account Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{t("account_information")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								{t("full_name")}
							</p>
							<p className="text-base">
								{userProfile?.first_name} {userProfile?.last_name}
							</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								{t("email")}
							</p>
							<p className="text-base">{userProfile?.email || t("not_set")}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								{t("phone")}
							</p>
							<p className="text-base">{userProfile?.phone_number}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								{t("account_type")}
							</p>
							<p className="text-base capitalize">{userProfile?.user_type}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
