import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Revalidate sitemap every hour
export const revalidate = 3600;

// Supported locales
const locales = ["en", "ar"] as const;

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
	const baseUrl = "https://www.aidxbait.com";

	// Fetch all products
	const products = await getAllProducts();

	// Define static page paths (without locale prefix)
	const staticPagePaths = [
		{ path: "", priority: 1, changeFrequency: "daily" as const },
		{ path: "services/store", priority: 0.9, changeFrequency: "daily" as const },
		{ path: "about", priority: 0.5, changeFrequency: "monthly" as const },
		{ path: "contact", priority: 0.5, changeFrequency: "monthly" as const },
		{ path: "services", priority: 0.8, changeFrequency: "weekly" as const },
		{ path: "home-visits", priority: 0.7, changeFrequency: "weekly" as const },
		{ path: "testimonials", priority: 0.6, changeFrequency: "monthly" as const },
	];

	// Generate static pages with both locales
	const staticPages: MetadataRoute.Sitemap = staticPagePaths.flatMap((page) => {
		return locales.map((locale) => ({
			url: `${baseUrl}/${locale}/${page.path}/`.replace(/\/\/$/, "/"),
			lastModified: new Date(),
			changeFrequency: page.changeFrequency,
			priority: page.priority,
			alternates: {
				languages: {
					en: `${baseUrl}/en/${page.path}/`.replace(/\/\/$/, "/"),
					ar: `${baseUrl}/ar/${page.path}/`.replace(/\/\/$/, "/"),
				},
			},
		}));
	});

	// Category pages (based on joints) - Generate for both locales
	const joints = ["knee", "shoulder", "back", "hip", "ankle", "wrist", "elbow", "neck"];
	const categoryPages: MetadataRoute.Sitemap = joints.flatMap((joint) => {
		return locales.map((locale) => ({
			url: `${baseUrl}/${locale}/services/store/?joint=${joint}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.6,
			alternates: {
				languages: {
					en: `${baseUrl}/en/services/store/?joint=${joint}`,
					ar: `${baseUrl}/ar/services/store/?joint=${joint}`,
				},
			},
		}));
	});

	// Generate product URLs for both locales
	const productUrls: MetadataRoute.Sitemap = products.flatMap((product: any) => {
		return locales.map((locale) => ({
			url: `${baseUrl}/${locale}/services/store/products/${product.id}/`,
			lastModified: new Date(product.updated_at || product.created_at),
			changeFrequency: "weekly" as const,
			priority: 0.7,
			alternates: {
				languages: {
					en: `${baseUrl}/en/services/store/products/${product.id}/`,
					ar: `${baseUrl}/ar/services/store/products/${product.id}/`,
				},
			},
		}));
	});

	// Combine all URLs
	return [...staticPages, ...categoryPages, ...productUrls];
}
