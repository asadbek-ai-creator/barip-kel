import { en, type Dictionary, type TranslationKey } from './en';
import { ru } from './ru';
import { BCP47, type Locale } from './locales';

export const DICTIONARIES: Record<Locale, Dictionary> = { en, ru };

export type { Dictionary, TranslationKey };
export type { Locale };
export {
  BCP47,
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  isLocale,
} from './locales';
export { firstName, localName } from './names';

export type Vars = Record<string, string | number>;

/** Plural-aware key families; `t` picks the right suffix from the count. */
export type PluralKey = 'count.children' | 'count.stops';

const PLACEHOLDER = /\{(\w+)\}/g;

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(PLACEHOLDER, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/**
 * Look a key up in `locale`, falling back to English and finally to the key
 * itself — a missing translation shows up as a visible key, never as a blank.
 */
export function translate(locale: Locale, key: TranslationKey, vars?: Vars): string {
  const template = DICTIONARIES[locale][key] ?? en[key] ?? key;
  return fill(template, vars);
}

const pluralRules = new Map<Locale, Intl.PluralRules>();

function rulesFor(locale: Locale): Intl.PluralRules {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(BCP47[locale]);
    pluralRules.set(locale, rules);
  }
  return rules;
}

/**
 * "1 остановка" / "2 остановки" / "5 остановок" — the form Russian needs and
 * English does not, decided by `Intl.PluralRules` rather than by `n === 1`.
 */
export function translatePlural(
  locale: Locale,
  key: PluralKey,
  count: number,
  vars?: Vars,
): string {
  const category = rulesFor(locale).select(count);
  const dict = DICTIONARIES[locale];
  const exact = `${key}_${category}` as TranslationKey;
  const template = dict[exact] ?? dict[`${key}_other` as TranslationKey] ?? key;
  return fill(template, { count, ...vars });
}

/** "07:42" in this locale's convention, or null for a missing timestamp. */
export function formatTime(locale: Locale, iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString(BCP47[locale], { hour: '2-digit', minute: '2-digit' });
}
