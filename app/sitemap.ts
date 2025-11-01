import { MetadataRoute } from "next";

// Fetch all available products for sitemap
async function getAllProducts() {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/products`, {
			cache: "no-store",
		});

		if (!response.ok) {
			console.error("Failed to fetch products for sitemap");
			return [];
		}

		const result = await response.json();
		if (result.success && result.data) {
			return result.data;
		}
		return [];
	} catch (error) {
		console.error("Error fetching products for sitemap:", error);
		return [];
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	// Fetch all products
	const products = await getAllProducts();

	// Generate product URLs
	const productUrls: MetadataRoute.Sitemap = products.map((product: any) => ({
		url: `${baseUrl}/services/store/products/${product.id}`,
		lastModified: new Date(product.updated_at || product.created_at),
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${baseUrl}/services/store`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/services`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/home-visits`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		},
	];

	// Category pages (based on joints)
	const categoryPages: MetadataRoute.Sitemap = [
		"knee",
		"shoulder",
		"back",
		"hip",
		"ankle",
		"wrist",
		"elbow",
		"neck",
	].map((joint) => ({
		url: `${baseUrl}/services/store?joint=${joint}`,
		lastModified: new Date(),
		changeFrequency: "weekly" as const,
		priority: 0.6,
	}));

	// Combine all URLs
	return [...staticPages, ...categoryPages, ...productUrls];
}
