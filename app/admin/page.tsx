'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, Bus, CircleDot, GraduationCap, Phone, RotateCcw } from 'lucide-react';
import type { StudentStatus } from '@/types';
import { DRIVER, ROUTE_WAYPOINTS, SCHOOL_INDEX } from '@/lib/mockData';
import {
  hasPassed,
  isTripRunning,
  nextWaypointIndex,
  rosterCounts,
  safeArrivalRate,
  studentsAtStop,
} from '@/lib/route';
import { STATUS_META } from '@/lib/status';
import { useBusSync } from '@/hooks/useBusSync';
import { BusMap, type MapPin } from '@/components/BusMap';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { stopColour } from '@/components/StudentCard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/lib/i18n/context';

/** Narrowed with `as const` so each id keys straight into `admin.filter.*`. */
const FILTERS = ['all', 'picked_up', 'at_school', 'absent_today'] as const;

export default function AdminPage() {
  const { state, hydrated, resetDemo } = useBusSync();
  const { t, tn, name, time } = useI18n();
  const [filter, setFilter] = useState<'all' | StudentStatus>('all');

  const running = isTripRunning(state.tripMode);
  const counts = rosterCounts(state);
  const rate = safeArrivalRate(state);
  const heading = nextWaypointIndex(state.bus, state.tripMode);

  const pins: MapPin[] = useMemo(
    () =>
      ROUTE_WAYPOINTS.map((wp, i) => {
        const kids = studentsAtStop(state.students, i);
        return {
          id: `wp-${i}`,
          glyph: wp.kind === 'school' ? 'S' : String(i + 1),
          coords: wp.coords,
          title: t(`waypoint.${wp.id}.name`),
          subtitle:
            wp.kind === 'school'
              ? t('waypoint.school.address')
              : tn('count.children', kids.length),
          color: wp.kind === 'school' ? STATUS_META.at_school.hex : stopColour(kids),
        };
      }),
    [state.students, t, tn],
  );

  const route = useMemo(() => ROUTE_WAYPOINTS.map((w) => w.coords), []);

  const rows = state.students.filter((s) => filter === 'all' || s.status === filter);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-4 lg:px-6">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-4">
        <Link
          href="/"
          aria-label={t('common.back')}
          className="-ml-1 grid size-8 place-items-center rounded-sm text-faint transition-colors hover:text-chalk"
        >
          <ArrowLeft className="size-[18px]" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[24px] leading-8 font-semibold">
            {t('admin.title')}
          </h1>
          <p className="text-[13px] leading-5 text-mute">
            {t('admin.subtitle', {
              trip: t(`trip.${state.tripMode}`),
              name: name('driver', DRIVER.name),
            })}
          </p>
        </div>
        <LanguageSwitcher />
        <button
          type="button"
          onClick={resetDemo}
          className="flex h-10 items-center gap-2 rounded-sm border border-line px-3 text-[14px] font-semibold text-mute transition-colors hover:text-chalk"
        >
          <RotateCcw className="size-4" aria-hidden />
          {t('admin.reset')}
        </button>
      </header>

      {/* One instrument band, divided — not four floating cards */}
      <dl className="grid grid-cols-2 divide-line border-b border-line sm:grid-cols-4 sm:divide-x">
        <Kpi label={t('admin.kpi.buses')} value={running ? '1 / 1' : '0 / 1'} />
        <Kpi label={t('admin.kpi.enrolled')} value={String(counts.total)} />
        <Kpi
          label={t('admin.kpi.safeArrivals')}
          value={`${rate}%`}
          tone={rate === 100 ? 'text-board' : 'text-hiviz'}
        />
        <Kpi
          label={t('admin.kpi.absent')}
          value={String(counts.absent)}
          tone="text-skip"
        />
      </dl>

      {/* The route as one horizontal line across the whole fleet view */}
      <section
        className="border-b border-line py-5"
        aria-label={t('admin.routeProgress')}
      >
        <ol className="flex items-start">
          {ROUTE_WAYPOINTS.map((wp, i) => {
            const passed = running && hasPassed(state.bus, state.tripMode, i);
            const isHere = running && heading === i;
            const last = i === SCHOOL_INDEX;
            return (
              <li key={wp.id} className={`relative ${last ? 'shrink-0' : 'flex-1'}`}>
                <div className="flex items-center">
                  <span
                    className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 bg-ink ${
                      isHere
                        ? 'border-hiviz text-hiviz'
                        : passed
                          ? 'border-board/60 text-board/70'
                          : 'border-line text-faint'
                    }`}
                  >
                    {wp.kind === 'school' ? (
                      <GraduationCap className="size-4" aria-hidden />
                    ) : (
                      <CircleDot className="size-4" aria-hidden />
                    )}
                  </span>
                  {!last ? (
                    <span
                      className={`h-px flex-1 ${passed ? 'bg-board/40' : 'bg-line'}`}
                      aria-hidden
                    />
                  ) : null}
                  {isHere ? (
                    <span
                      className="absolute -top-3 left-[3px] grid size-[26px] place-items-center rounded-full bg-hiviz text-ink shadow-[0_0_0_4px_var(--color-ink)]"
                      aria-hidden
                    >
                      <Bus className="size-4" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-[9rem] pr-3 text-[12px] leading-4 text-mute">
                  {t(`waypoint.${wp.id}.name`)}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="h-[380px] overflow-hidden rounded-md border border-line lg:h-[560px]">
          <BusMap bus={state.bus} pins={pins} route={route} follow={running} />
        </div>

        <section className="min-w-0">
          <div className="flex flex-wrap gap-1.5 pb-3">
            {FILTERS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={`h-8 rounded-xs border px-3 text-[13px] font-medium transition-colors ${
                  filter === id
                    ? 'border-hiviz/60 bg-hiviz/10 text-hiviz'
                    : 'border-line text-mute hover:text-chalk'
                }`}
              >
                {t(`admin.filter.${id}`)}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] text-faint">
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t('admin.col.child')}
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t('admin.col.status')}
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t('admin.col.stop')}
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t('admin.col.parent')}
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {t('admin.col.updated')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={name(s.id, s.name)}
                          src={s.avatarUrl}
                          size={32}
                          dimmed={s.status === 'absent_today'}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[14px] leading-5 font-medium">
                            {name(s.id, s.name)}
                          </p>
                          <p className="blind text-[11px] leading-4 text-mute">
                            {name(s.grade, s.grade)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-2 text-[13px] leading-5 text-mute">
                      {t(`waypoint.${ROUTE_WAYPOINTS[s.stopIndex].id}.name`)}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-[13px] leading-5">
                        {name(`parent.${s.id}`, s.parentName)}
                      </p>
                      <a
                        href={`tel:${s.parentPhone}`}
                        className="tnum inline-flex items-center gap-1 text-[12px] leading-4 text-mute transition-colors hover:text-hiviz"
                      >
                        <Phone className="size-3" aria-hidden />
                        {s.parentPhone}
                      </a>
                    </td>
                    <td className="tnum px-3 py-2 text-[13px] leading-5 text-faint">
                      {(hydrated && time(s.lastUpdated)) || t('common.none')}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[14px] text-faint">
                      {t('admin.empty')}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({
  label,
  value,
  tone = 'text-chalk',
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="px-1 py-4 sm:px-5">
      <dd className={`tnum font-display text-[32px] leading-10 font-bold ${tone}`}>{value}</dd>
      <dt className="text-[13px] leading-5 text-mute">{label}</dt>
    </div>
  );
}
