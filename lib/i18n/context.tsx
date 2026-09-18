'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BCP47,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  formatTime,
  isLocale,
  localName,
  translate,
  translatePlural,
  type Locale,
  type PluralKey,
  type TranslationKey,
  type Vars,
} from './index';

export interface I18n {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a key, filling any `{placeholders}`. */
  t: (key: TranslationKey, vars?: Vars) => string;
  /** Translate a counted phrase, choosing the plural form for `count`. */
  tn: (key: PluralKey, count: number, vars?: Vars) => string;
  /** A proper noun from the synced state, by record id. */
  name: (key: string, fallback: string) => string;
  /** A timestamp as a clock face in this locale, or null. */
  time: (iso?: string) => string | null;
}

const I18nContext = createContext<I18n | null>(null);

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Starts on the default so the server render and the first client render
  // agree; the stored choice is applied in the effect below.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      // Private mode, or storage disabled — the default stands.
    }
  }, []);

  // Other tabs of the demo follow the language along with the bus.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCALE_STORAGE_KEY && isLocale(e.newValue)) {
        setLocaleState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // The document itself is part of the UI: screen readers pick their voice
  // from <html lang>, and the tab title is the app's own label.
  useEffect(() => {
    document.documentElement.lang = BCP47[locale];
    document.title = translate(locale, 'app.title');
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Not remembering the choice is survivable; switching still works.
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      tn: (key, count, vars) => translatePlural(locale, key, count, vars),
      name: (key, fallback) => localName(locale, key, fallback),
      time: (iso) => formatTime(locale, iso),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
