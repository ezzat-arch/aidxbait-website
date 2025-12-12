import "../globals.css";
import NavbarDiv from "@/components/ui/navbar";
import { CartProvider } from "@/contexts/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { TrackingProvider } from "@/contexts/tracking-context";
import { CartSidebar } from "@/components/store/CartSidebar";
import { Toaster } from "@/components/ui/toaster";
import { NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	setRequestLocale,
	getTranslations,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "layout.meta" });

	return {
		metadataBase: new URL("https://www.aidxbait.com"),
		title: t("title"),
		description: t("description"),
		generator: "aidxbait",
		alternates: {
			canonical: `/${locale}`,
			languages: {
				en: "/en",
				ar: "/ar",
			},
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Ensure that the incoming `locale` is valid
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	// Get messages for the locale
	const messages = await getMessages();

	// Determine text direction
	const direction = locale === "ar" ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={direction}>
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
				/>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="font-sans" suppressHydrationWarning={true}>
				<NextIntlClientProvider
					messages={messages}
					locale={locale}
					timeZone="Africa/Cairo"
					now={new Date()}
				>
					<AuthProvider>
						<TrackingProvider>
							<CartProvider>
								<NavbarDiv />
								{children}
								<CartSidebar />
								<Toaster />
							</CartProvider>
						</TrackingProvider>
					</AuthProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
