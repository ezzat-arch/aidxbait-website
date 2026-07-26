import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import type { ShopifyProductCardModel } from "@/lib/shopify/types";

interface BlogRelatedProductsProps {
	products: ShopifyProductCardModel[];
	heading: string;
}

/**
 * "Related products" section under a blog post. Reuses the store's Shopify
 * product card (links to /services/store/products/[handle]/ and localizes the
 * price). Renders nothing when the post has no related products.
 */
export function BlogRelatedProducts({
	products,
	heading,
}: BlogRelatedProductsProps) {
	if (products.length === 0) return null;

	return (
		<section aria-labelledby="related-products-heading" className="mt-16">
			<h2 id="related-products-heading" className="text-3xl font-bold mb-6">
				{heading}
			</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{products.map((product) => (
					<ShopifyProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	);
}
