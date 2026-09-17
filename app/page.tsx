'use client';

import Link from 'next/link';
import { Bus, MonitorDot, RotateCcw, Users } from 'lucide-react';
import { DRIVER, SCHOOL_NAME } from '@/lib/mockData';
import { useBusSync } from '@/hooks/useBusSync';

const ROLES = [
  {
    href: '/driver',
    icon: Bus,
    title: 'Driver',
    lede: 'Check children on and off the bus, and drive the route.',
    path: '/driver',
  },
  {
    href: '/parent',
    icon: Users,
    title: 'Parent',
    lede: 'Follow the bus, see when your child boards, skip a day.',
    path: '/parent',
  },
  {
    href: '/admin',
    icon: MonitorDot,
    title: 'School dispatch',
    lede: 'Fleet, attendance and every parent contact in one view.',
    path: '/admin',
  },
] as const;

export default function Home() {
  const { state, resetDemo } = useBusSync();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-5 py-10">
      <p className="blind text-[14px] text-hiviz">Bus {DRIVER.busNumber} · Nókis</p>
      <h1 className="mt-1 font-display text-[44px] leading-[1.05] font-bold sm:text-[56px]">
        SafeBus
      </h1>
      <p className="mt-3 max-w-[54ch] text-[16px] leading-6 text-mute">
        Live school transport for {SCHOOL_NAME}. One bus, {state.students.length} children,
        and three people who need to know exactly where it is.
      </p>

      <nav className="mt-8 grid gap-3 sm:grid-cols-3">
        {ROLES.map(({ href, icon: Icon, title, lede, path }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-md border border-line bg-ink-2 p-4 transition-colors hover:border-hiviz/60"
          >
            <Icon
              className="size-6 text-mute transition-colors group-hover:text-hiviz"
              aria-hidden
            />
            <h2 className="mt-3 font-display text-[20px] leading-7 font-semibold">{title}</h2>
            <p className="mt-1 flex-1 text-[14px] leading-5 text-mute">{lede}</p>
            <span className="mt-3 text-[13px] text-faint">{path}</span>
          </Link>
        ))}
      </nav>

      <section className="mt-8 rounded-md border border-hiviz/25 bg-hiviz/[0.06] p-4">
        <h2 className="font-display text-[17px] leading-6 font-semibold text-hiviz">
          Try the live sync
        </h2>
        <ol className="mt-2 space-y-1 text-[14px] leading-6 text-chalk/85">
          <li>1. Open the driver app in one window and the parent app in another.</li>
          <li>2. On the driver, start the morning trip and switch on Simulate.</li>
          <li>3. Tap Boarded for a child — the parent window updates as you do it.</li>
        </ol>
        <p className="mt-2 text-[13px] leading-5 text-mute">
          Both windows share one state over BroadcastChannel, so no server is involved.
        </p>
      </section>

      <button
        type="button"
        onClick={resetDemo}
        className="mt-4 flex h-10 w-fit items-center gap-2 rounded-sm border border-line px-3 text-[14px] font-semibold text-mute transition-colors hover:text-chalk"
      >
        <RotateCcw className="size-4" aria-hidden />
        Reset demo data
      </button>
    </main>
  );
}
