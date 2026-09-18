'use client';

import Link from 'next/link';
import { Bus, MonitorDot, RotateCcw, Users } from 'lucide-react';
import { DRIVER } from '@/lib/mockData';
import { useBusSync } from '@/hooks/useBusSync';
import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const ROLES = [
  { href: '/driver', icon: Bus, key: 'driver' },
  { href: '/parent', icon: Users, key: 'parent' },
  { href: '/admin', icon: MonitorDot, key: 'admin' },
] as const;

export default function Home() {
  const { state, resetDemo } = useBusSync();
  const { t, tn } = useI18n();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-5 py-10">
      <div className="flex items-start justify-between gap-3">
        <p className="blind text-[14px] text-hiviz">
          {t('home.eyebrow', { number: DRIVER.busNumber })}
        </p>
        <LanguageSwitcher />
      </div>
      <h1 className="mt-1 font-display text-[44px] leading-[1.05] font-bold sm:text-[56px]">
        barıp kel
      </h1>
      <p className="mt-3 max-w-[54ch] text-[16px] leading-6 text-mute">
        {t('home.lede', {
          school: t('waypoint.school.name'),
          children: tn('count.children', state.students.length),
        })}
      </p>

      <nav className="mt-8 grid gap-3 sm:grid-cols-3">
        {ROLES.map(({ href, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-md border border-line bg-ink-2 p-4 transition-colors hover:border-hiviz/60"
          >
            <Icon
              className="size-6 text-mute transition-colors group-hover:text-hiviz"
              aria-hidden
            />
            <h2 className="mt-3 font-display text-[20px] leading-7 font-semibold">
              {t(`home.role.${key}.title`)}
            </h2>
            <p className="mt-1 flex-1 text-[14px] leading-5 text-mute">
              {t(`home.role.${key}.lede`)}
            </p>
            <span className="mt-3 text-[13px] text-faint">{href}</span>
          </Link>
        ))}
      </nav>

      <section className="mt-8 rounded-md border border-hiviz/25 bg-hiviz/[0.06] p-4">
        <h2 className="font-display text-[17px] leading-6 font-semibold text-hiviz">
          {t('home.demo.title')}
        </h2>
        <ol className="mt-2 space-y-1 text-[14px] leading-6 text-chalk/85">
          <li>{t('home.demo.step1')}</li>
          <li>{t('home.demo.step2')}</li>
          <li>{t('home.demo.step3')}</li>
        </ol>
        <p className="mt-2 text-[13px] leading-5 text-mute">{t('home.demo.note')}</p>
      </section>

      <button
        type="button"
        onClick={resetDemo}
        className="mt-4 flex h-10 w-fit items-center gap-2 rounded-sm border border-line px-3 text-[14px] font-semibold text-mute transition-colors hover:text-chalk"
      >
        <RotateCcw className="size-4" aria-hidden />
        {t('home.reset')}
      </button>
    </main>
  );
}
