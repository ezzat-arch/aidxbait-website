"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("settings.layout");

	useEffect(() => {
		if (!loading && !user) {
			router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
		}
	}, [user, loading, router, pathname]);

	if (loading) {
		return (
			<div className="min-h-screen bg-background pt-36 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
					<p className="text-muted-foreground">{t("loading")}</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background pt-28">
			<div className="container mx-auto px-4 py-8 max-w-3xl">{children}</div>
		</div>
	);
}
