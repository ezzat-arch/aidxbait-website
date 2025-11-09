'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getLocaleDisplayName, getLocaleFlag } from '@/lib/i18n/utils';
import { Locale } from '@/types/i18n';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const pathname = usePathname();

	const handleLocaleChange = (newLocale: Locale) => {
		// Navigate to the same path with new locale
		router.replace(pathname, { locale: newLocale });
		
		// Store locale preference in cookie
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
				<Globe className="w-4 h-4" />
				<span className="hidden sm:inline">{getLocaleDisplayName(locale)}</span>
				<span className="sm:hidden">{getLocaleFlag(locale)}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[150px]">
				{routing.locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => handleLocaleChange(loc as Locale)}
						className={`flex items-center gap-2 cursor-pointer ${
							locale === loc ? 'bg-blue-50 text-blue-600' : ''
						}`}
					>
						<span className="text-lg">{getLocaleFlag(loc as Locale)}</span>
						<span>{getLocaleDisplayName(loc as Locale)}</span>
						{locale === loc && (
							<span className="ml-auto text-blue-600">✓</span>
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Mobile version with different styling
export function LocaleSwitcherMobile() {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const pathname = usePathname();

	const handleLocaleChange = (newLocale: Locale) => {
		// Navigate to the same path with new locale
		router.replace(pathname, { locale: newLocale });
		
		// Store locale preference in cookie
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return (
		<div className="flex items-center gap-2">
			{routing.locales.map((loc) => (
				<button
					key={loc}
					onClick={() => handleLocaleChange(loc as Locale)}
					className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
						locale === loc
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					<span className="flex items-center gap-1">
						<span>{getLocaleFlag(loc as Locale)}</span>
						<span>{loc.toUpperCase()}</span>
					</span>
				</button>
			))}
		</div>
	);
}

