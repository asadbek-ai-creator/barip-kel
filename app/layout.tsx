import type { Metadata, Viewport } from 'next';
import {
  Barlow,
  Barlow_Semi_Condensed,
  Roboto,
  Roboto_Condensed,
} from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import { I18nProvider } from '@/lib/i18n/context';
import { BCP47, DEFAULT_LOCALE, DICTIONARIES } from '@/lib/i18n';

// Barlow is drawn from highway signage — the native lettering of this subject.
const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// The condensed width does the work of a bus destination blind.
const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: '--font-barlow-sc',
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

/**
 * Barlow ships no Cyrillic, so Russian would otherwise drop to whatever the OS
 * offers. These two sit directly behind it in the stack: the browser resolves
 * fonts per glyph, so Latin still renders in Barlow and only Cyrillic falls
 * through — to a grotesk of the same build rather than to Arial.
 */
const roboto = Roboto({
  variable: '--font-cyrillic',
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
  variable: '--font-cyrillic-sc',
  subsets: ['cyrillic', 'latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

// Rendered before any language preference is known, so it matches the default
// locale; `I18nProvider` retitles the tab once a stored choice is read.
export const metadata: Metadata = {
  title: DICTIONARIES[DEFAULT_LOCALE]['app.title'],
  description:
    'Live school bus tracking for drivers, parents and school dispatch. · Отслеживание школьного автобуса для водителей, родителей и диспетчерской школы.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0c1524',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={BCP47[DEFAULT_LOCALE]}
      className={`${barlow.variable} ${barlowSemiCondensed.variable} ${roboto.variable} ${robotoCondensed.variable}`}
    >
      <body className="min-h-dvh bg-ink text-chalk antialiased">
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
