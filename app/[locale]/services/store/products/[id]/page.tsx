import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import { Product, ProductsResponse } from "@/lib/store-types";
import { localizeProduct, localizeProducts } from "@/lib/i18n/data-utils";
import { Locale } from "@/types/i18n";

interface ProductPageProps {
	params: Promise<{
		locale: string;
		id: string;
	}>;
}

// Fetch product data from API
async function getProduct(id: string): Promise<Product | null> {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/products/${id}`, {
			cache: "no-store", // Always fetch fresh data for product details
		});

		if (!response.ok) {
			return null;
		}

		const data: ProductsResponse = await response.json();
		
		if (!data.success || !data.data || data.data.length === 0) {
			return null;
		}

		return data.data[0];
	} catch (error) {
		console.error("Error fetching product:", error);
		return null;
	}
}

// Fetch related products (same joint or category)
async function getRelatedProducts(product: Product): Promise<Product[]> {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		
		// Try to fetch products from the same joint first
		let relatedProducts: Product[] = [];
		
		if (product.joints.length > 0) {
			const jointName = product.joints[0].joint_name.toLowerCase().split(' ')[0];
			const response = await fetch(
				`${baseUrl}/api/products?joint=${jointName}&in_stock=true`,
				{ cache: "no-store" }
			);

			if (response.ok) {
				const data: ProductsResponse = await response.json();
				if (data.success && data.data) {
					// Filter out the current product and limit to 4 items
					relatedProducts = data.data
						.filter((p) => p.id !== product.id)
						.slice(0, 4);
				}
			}
		}

		// If we don't have enough related products, fetch by category
		if (relatedProducts.length < 4 && product.category_id) {
			const response = await fetch(
				`${baseUrl}/api/products?category_id=${product.category_id}&in_stock=true`,
				{ cache: "no-store" }
			);

			if (response.ok) {
				const data: ProductsResponse = await response.json();
				if (data.success && data.data) {
					const categoryProducts = data.data
						.filter((p) => p.id !== product.id && !relatedProducts.find((rp) => rp.id === p.id))
						.slice(0, 4 - relatedProducts.length);
					
					relatedProducts = [...relatedProducts, ...categoryProducts];
				}
			}
		}

		return relatedProducts;
	} catch (error) {
		console.error("Error fetching related products:", error);
		return [];
	}
}

// Generate metadata for SEO
export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { locale, id } = await params;
	const product = await getProduct(id);

	if (!product) {
		return {
			title: "Product Not Found",
		};
	}

	const productName = locale === "ar" ? product.name_ar : product.name;
	const productDescription =
		locale === "ar" ? product.description_ar : product.description;
	const mainImage = product.images.find((img) => img.is_main)?.image_url || 
		product.images[0]?.image_url;

	const effectivePrice = product.discounted_price || product.price;
	const priceText = `${effectivePrice} ${product.currency}`;

	return {
		title: `${productName} | AidXBait Store`,
		description:
			productDescription?.substring(0, 160) ||
			`Buy ${productName} for ${priceText}`,
		openGraph: {
			title: productName,
			description:
				productDescription?.substring(0, 160) ||
				`Buy ${productName} for ${priceText}`,
			images: mainImage ? [mainImage] : [],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: productName,
			description:
				productDescription?.substring(0, 160) ||
				`Buy ${productName} for ${priceText}`,
			images: mainImage ? [mainImage] : [],
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { locale, id } = await params;

	// Enable static rendering
	setRequestLocale(locale);

	// Fetch product data
	const product = await getProduct(id);

	// If product not found, show 404
	if (!product) {
		notFound();
	}

	// Fetch related products
	const relatedProducts = await getRelatedProducts(product);

	return (
		<ProductDetailClient 
			product={localizeProduct(product, locale as Locale)} 
			relatedProducts={localizeProducts(relatedProducts, locale as Locale)}
			locale={locale as Locale}
		/>
	);
}

