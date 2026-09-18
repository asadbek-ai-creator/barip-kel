'use client';

import { LOCALES } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/context';

/**
 * Two letters in a bordered pair — the same segmented control the driver's
 * direction toggle uses, at header scale so it never competes with the route.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className={`flex shrink-0 items-center gap-px rounded-sm border border-line p-px ${className}`}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={t(`lang.${code}`)}
            className={`blind h-7 rounded-xs px-2 text-[12px] transition-colors ${
              active ? 'bg-hiviz text-ink' : 'text-faint hover:text-chalk'
            }`}
          >
            {t(`lang.${code}.short`)}
          </button>
        );
      })}
    </div>
  );
}
