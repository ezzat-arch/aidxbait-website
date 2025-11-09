export type Locale = 'en' | 'ar';

export interface LocalizedContent {
  getLocalizedField<T>(obj: T, field: keyof T, locale: Locale): string;
}

