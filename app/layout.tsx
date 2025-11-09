import { Analytics } from '@vercel/analytics/next';

// Since we have a `[locale]` directory, this layout only handles the root
// and provides a minimal wrapper
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			{children}
			<Analytics />
		</>
	);
}
