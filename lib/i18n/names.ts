import type { Locale } from './locales';

/**
 * Proper nouns that live in the synced app state rather than in the UI copy:
 * children, parents, the driver, and class names.
 *
 * They are keyed off the record id instead of the English string, because the
 * state travels between tabs and must not change shape per language. A locale
 * with no entry for a key falls back to the Latin form carried in the data,
 * which is what `en` relies on.
 */
const PROPER_NOUNS: Record<Locale, Record<string, string>> = {
  en: {},
  ru: {
    // children
    s1: 'Азамат Даулетов',
    s2: 'Нуржамал Даулетова',
    s3: 'Гульзар Аллаярова',
    s4: 'Ислам Бердимуратов',
    s5: 'Даулет Жумабаев',
    s6: 'Айсултан Калибаев',
    s7: 'Айжамал Курбанова',
    s8: 'Темирбек Утемуратов',

    // the parent on each child's account
    'parent.s1': 'Тимур Даулетов',
    'parent.s2': 'Тимур Даулетов',
    'parent.s3': 'Айзада Аллаярова',
    'parent.s4': 'Мурат Бердимуратов',
    'parent.s5': 'Полат Жумабаев',
    'parent.s6': 'Бегис Калибаев',
    'parent.s7': 'Шийрин Курбанова',
    'parent.s8': 'Сарсенбай Утемуратов',

    // the signed-in personas
    driver: 'Жаксылык Нурымбетов',
    'parent.me': 'Тимур Даулетов',

    // class names — Russian schools letter their classes in Cyrillic
    '3-C': '3-В',
    '4-A': '4-А',
    '4-B': '4-Б',
    '5-A': '5-А',
    '6-B': '6-Б',
    '7-A': '7-А',
    '8-B': '8-Б',
  },
};

/** The localised proper noun for `key`, or `fallback` when none is defined. */
export function localName(locale: Locale, key: string, fallback: string): string {
  return PROPER_NOUNS[locale][key] ?? fallback;
}

/** First name only — how every screen addresses a child. */
export function firstName(fullName: string): string {
  return fullName.split(/\s+/)[0] ?? fullName;
}
