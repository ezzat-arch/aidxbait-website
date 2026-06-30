import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = "https://www.doctoory.com";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/api/*",
					"/app/*",
					"/services/store/checkout",
					"/profile/*",
					"/auth/*",
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
