export const LOCALES = ['ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * What the app renders on the server and on the very first client paint.
 * A stored preference is applied right after mount, which keeps the two
 * renders identical and hydration quiet.
 */
export const DEFAULT_LOCALE: Locale = 'ru';

/** Key under which the chosen language is remembered. */
export const LOCALE_STORAGE_KEY = 'safebus.locale';

/** BCP 47 tags, for Intl formatters and the <html lang> attribute. */
export const BCP47: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-GB',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
