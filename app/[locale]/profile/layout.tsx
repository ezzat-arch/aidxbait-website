"use client";

import { useAuth } from "@/contexts/auth-context";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { Package, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("profile.layout.text");
	const tNav = useTranslations("profile.layout.data.name");
	const locale = useLocale();
	const isRTL = locale === "ar";

	useEffect(() => {
		if (!loading && !user) {
			router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
		}
	}, [user, loading, router, pathname]);

	if (loading) {
		return (
			<div className="min-h-screen bg-background pt-36 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">{t("loading")}</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	const navigation = [
		{
			name: tNav("my_orders"),
			href: "/profile/my-orders" as const,
			icon: Package,
		},
		{
			name: tNav("my_addresses"),
			href: "/profile/addresses" as const,
			icon: MapPin,
		},
	];

	const NavigationLinks = () => (
		<>
			{navigation.map((item) => {
				const isActive = pathname.startsWith(item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
							isActive
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground"
						}`}
					>
						<item.icon className="h-5 w-5" />
						<span className="font-medium">{item.name}</span>
					</Link>
				);
			})}
		</>
	);

	return (
		<div className="min-h-screen bg-background pt-28">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Desktop Sidebar */}
					<aside className="hidden lg:block w-64 flex-shrink-0">
						<div className="sticky top-32 space-y-2">
							<div className="mb-6">
								<h2 className="text-2xl font-bold mb-2">{t("my_account")}</h2>
								<p className="text-sm text-muted-foreground">
									{t("manage_your_orders_and_addresses")}
								</p>
							</div>
							<NavigationLinks />
						</div>
					</aside>

					{/* Mobile Navigation */}
					<div className="lg:hidden">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold">{t("my_account")}</h2>
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="outline" size="icon">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side={isRTL ? "right" : "left"}>
									<div className="mt-8 space-y-2">
										<NavigationLinks />
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>

					{/* Main Content */}
					<main className="flex-1 min-w-0">{children}</main>
				</div>
			</div>
		</div>
	);
}
