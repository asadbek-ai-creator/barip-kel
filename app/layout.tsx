import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Semi_Condensed } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';

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

export const metadata: Metadata = {
  title: 'SafeBus — Nókis school transport',
  description:
    'Live school bus tracking for drivers, parents and school dispatch.',
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
    <html lang="en" className={`${barlow.variable} ${barlowSemiCondensed.variable}`}>
      <body className="min-h-dvh bg-ink text-chalk antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
