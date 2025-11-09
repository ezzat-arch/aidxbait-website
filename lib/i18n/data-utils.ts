import { Locale } from '@/types/i18n';
import type { Product, ProductCategory, ProductJoint } from '@/lib/store-types';

/**
 * Get localized field value from an object
 * Falls back to English if Arabic version is not available
 */
export function getLocalizedField<T extends Record<string, any>>(
	obj: T,
	fieldName: string,
	locale: Locale
): string {
	if (locale === 'ar') {
		const arField = `${fieldName}_ar`;
		// Return Arabic version if it exists and is not empty, otherwise fall back to English
		if (arField in obj && obj[arField] && obj[arField].trim() !== '') {
			return obj[arField];
		}
	}
	
	// Fall back to English version
	return obj[fieldName] || '';
}

/**
 * Get localized product name
 */
export function getLocalizedProductName(product: Product, locale: Locale): string {
	return locale === 'ar' && product.name_ar && product.name_ar.trim() !== ''
		? product.name_ar
		: product.name;
}

/**
 * Get localized product description
 */
export function getLocalizedProductDescription(
	product: Product,
	locale: Locale
): string | null {
	if (locale === 'ar' && product.description_ar && product.description_ar.trim() !== '') {
		return product.description_ar;
	}
	return product.description;
}

/**
 * Get localized category name
 */
export function getLocalizedCategoryName(
	category: ProductCategory,
	locale: Locale
): string {
	return locale === 'ar' && category.name_ar && category.name_ar.trim() !== ''
		? category.name_ar
		: category.name;
}

/**
 * Get localized joint name
 */
export function getLocalizedJointName(joint: ProductJoint, locale: Locale): string {
	return locale === 'ar' && joint.joint_name_ar && joint.joint_name_ar.trim() !== ''
		? joint.joint_name_ar
		: joint.joint_name;
}

/**
 * Localize a product object (mutates the object for display)
 * Creates a display version with localized fields
 */
export function localizeProduct(product: Product, locale: Locale): Product {
	return {
		...product,
		name: getLocalizedProductName(product, locale),
		description: getLocalizedProductDescription(product, locale),
		category: product.category
			? {
					...product.category,
					name: getLocalizedCategoryName(product.category, locale),
			  }
			: undefined,
		joints: product.joints.map((joint) => ({
			...joint,
			joint_name: getLocalizedJointName(joint, locale),
		})),
	};
}

/**
 * Localize multiple products
 */
export function localizeProducts(products: Product[], locale: Locale): Product[] {
	return products.map((product) => localizeProduct(product, locale));
}

/**
 * Localize a category
 */
export function localizeCategory(
	category: ProductCategory,
	locale: Locale
): ProductCategory {
	return {
		...category,
		name: getLocalizedCategoryName(category, locale),
	};
}

/**
 * Localize multiple categories
 */
export function localizeCategories(
	categories: ProductCategory[],
	locale: Locale
): ProductCategory[] {
	return categories.map((category) => localizeCategory(category, locale));
}

