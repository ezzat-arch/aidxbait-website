import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Revalidate sitemap every hour
export const revalidate = 3600;

// Fetch all available products for sitemap directly from Supabase
async function getAllProducts() {
	try {
		// Create Supabase client for server-side use
		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
				},
			}
		);

		const { data: products, error } = await supabase
			.from("products")
			.select("id, created_at, updated_at")
			.eq("soft_deleted", false)
			.eq("is_available", true);

		if (error) {
			console.error("Failed to fetch products for sitemap:", error);
			return [];
		}

		return products || [];
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
