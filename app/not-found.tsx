import Link from "next/link";
import "./globals.css";

// Root not-found page for non-localized paths
// This catches 404s for URLs without a locale prefix (e.g., /invalid-page)
export default function NotFound() {
	return (
		<html lang="en">
			<head>
				<title>404 - Page Not Found | AidXBait</title>
			</head>
			<body className="bg-gradient-to-br from-blue-50 to-white">
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center px-4">
						<h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
						<h2 className="text-3xl font-semibold text-gray-800 mb-4">
							Page Not Found
						</h2>
						<p className="text-gray-600 mb-8">
							The page you are looking for does not exist.
						</p>
						<Link
							href="/en"
							className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Back to Home
						</Link>
					</div>
				</div>
			</body>
		</html>
	);
}
