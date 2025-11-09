import { Locale } from '@/types/i18n';

/**
 * Check if the locale is RTL (Right-to-Left)
 */
export function isRTL(locale: Locale): boolean {
	return locale === 'ar';
}

/**
 * Get text direction for the locale
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
	return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get the opposite direction
 */
export function getOppositeDirection(locale: Locale): 'ltr' | 'rtl' {
	return isRTL(locale) ? 'ltr' : 'rtl';
}

/**
 * Format a number according to locale
 */
export function formatNumber(value: number, locale: Locale): string {
	return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
	value: number,
	currency: string = 'EGP',
	locale: Locale
): string {
	return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
		style: 'currency',
		currency: currency,
	}).format(value);
}

/**
 * Format a date according to locale
 */
export function formatDate(
	date: Date | string,
	locale: Locale,
	options?: Intl.DateTimeFormatOptions
): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat(
		locale === 'ar' ? 'ar-EG' : 'en-US',
		options || {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}
	).format(dateObj);
}

/**
 * Get locale display name (e.g., "English" or "العربية")
 */
export function getLocaleDisplayName(locale: Locale): string {
	const names: Record<Locale, string> = {
		en: 'English',
		ar: 'العربية',
	};
	return names[locale];
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: Locale): string {
	const flags: Record<Locale, string> = {
		en: '🇺🇸',
		ar: '🇪🇬',
	};
	return flags[locale];
}

