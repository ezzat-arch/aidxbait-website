import type { Metadata } from "next";
import "./globals.css";
import NavbarDiv from "@/components/ui/navbar";
import { CartProvider } from "@/contexts/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CartSidebar } from "@/components/store/CartSidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
	title: "AidXBait | Your Health Companion",
	description:
		"AidXBait is a platform that connects patients with healthcare providers. We offer a wide range of services including physical therapy, orthopedics, general medicine, home visits, and online consultations.",
	generator: "aidxbait",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
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
				<AuthProvider>
					<CartProvider>
						<NavbarDiv />
						{children}
						<CartSidebar />
						<Toaster />
					</CartProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
