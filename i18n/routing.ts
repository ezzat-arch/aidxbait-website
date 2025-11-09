import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Locale prefix configuration
  // 'as-needed' means the default locale won't have a prefix
  localePrefix: 'as-needed',

  // Enable automatic locale detection based on browser settings
  localeDetection: true
});

