"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
	const t = useTranslations("ui.NotFound");

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
			<div className="text-center px-4">
				<h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
				<h2 className="text-3xl font-semibold text-gray-800 mb-4">
					{t("title")}
				</h2>
				<p className="text-gray-600 mb-8">{t("description")}</p>
				<Link
					href="/"
					className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					{t("backHome")}
				</Link>
			</div>
		</div>
	);
}
