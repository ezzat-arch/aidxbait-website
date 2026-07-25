'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Locale } from '@/types/i18n';
import { cn } from '@/lib/utils';

function useLocaleToggle() {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const pathname = usePathname();

	const toggleLocale = () => {
		const newLocale: Locale = locale === 'en' ? 'ar' : 'en';

		// Navigate to the same path with new locale
		router.replace(pathname, { locale: newLocale });

		// Store locale preference in cookie
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return { locale, toggleLocale };
}

interface LocaleToggleProps {
	labels: Record<Locale, string>;
	className?: string;
}

function LocaleToggle({ labels, className }: LocaleToggleProps) {
	const { locale, toggleLocale } = useLocaleToggle();
	const t = useTranslations('ui.language');

	return (
		<button
			type="button"
			role="switch"
			aria-checked={locale === 'ar'}
			aria-label={t('switch_aria')}
			onClick={toggleLocale}
			dir="ltr"
			className={cn(
				'relative inline-flex items-center rounded-full bg-gray-100 border border-gray-200 p-0.5 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
				className
			)}
		>
			<span
				className={cn(
					'px-3 py-1 rounded-full text-sm font-medium transition-colors',
					locale === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'
				)}
			>
				{labels.en}
			</span>
			<span
				className={cn(
					'px-3 py-1 rounded-full text-sm font-medium transition-colors',
					locale === 'ar' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600'
				)}
			>
				{labels.ar}
			</span>
		</button>
	);
}

export function LocaleSwitcher() {
	return <LocaleToggle labels={{ en: 'English', ar: 'العربية' }} />;
}

// Mobile version — short labels, same toggle logic
export function LocaleSwitcherMobile() {
	return <LocaleToggle labels={{ en: 'EN', ar: 'AR' }} />;
}
