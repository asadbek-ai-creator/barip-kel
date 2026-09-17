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
import { STATUS_META, clockTime } from '@/lib/status';
import { useBusSync } from '@/hooks/useBusSync';
import { BusMap, type MapPin } from '@/components/BusMap';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { stopColour } from '@/components/StudentCard';

const FILTERS: Array<{ id: 'all' | StudentStatus; label: string }> = [
  { id: 'all', label: 'Everyone' },
  { id: 'picked_up', label: 'On bus' },
  { id: 'at_school', label: 'At school' },
  { id: 'absent_today', label: 'Absent' },
];

const TRIP_LABEL: Record<string, string> = {
  idle: 'No run in progress',
  morning_to_school: 'Morning run · Nókis → Mektep #1',
  afternoon_to_home: 'Afternoon run · Mektep #1 → Nókis',
  completed: 'Run finished',
};

export default function AdminPage() {
  const { state, hydrated, resetDemo } = useBusSync();
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
          title: wp.name,
          subtitle:
            wp.kind === 'school'
              ? wp.address
              : `${kids.length} ${kids.length === 1 ? 'child' : 'children'}`,
          color: wp.kind === 'school' ? STATUS_META.at_school.hex : stopColour(kids),
        };
      }),
    [state.students],
  );

  const route = useMemo(() => ROUTE_WAYPOINTS.map((w) => w.coords), []);

  const rows = state.students.filter((s) => filter === 'all' || s.status === filter);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-4 lg:px-6">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-4">
        <Link
          href="/"
          aria-label="Back to role switcher"
          className="-ml-1 grid size-8 place-items-center rounded-sm text-faint transition-colors hover:text-chalk"
        >
          <ArrowLeft className="size-[18px]" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[24px] leading-8 font-semibold">
            School #1 dispatch
          </h1>
          <p className="text-[13px] leading-5 text-mute">
            {TRIP_LABEL[state.tripMode]} · driver {DRIVER.name}
          </p>
        </div>
        <button
          type="button"
          onClick={resetDemo}
          className="flex h-10 items-center gap-2 rounded-sm border border-line px-3 text-[14px] font-semibold text-mute transition-colors hover:text-chalk"
        >
          <RotateCcw className="size-4" aria-hidden />
          Reset demo
        </button>
      </header>

      {/* One instrument band, divided — not four floating cards */}
      <dl className="grid grid-cols-2 divide-line border-b border-line sm:grid-cols-4 sm:divide-x">
        <Kpi label="Buses on the road" value={running ? '1 / 1' : '0 / 1'} />
        <Kpi label="Children enrolled" value={String(counts.total)} />
        <Kpi
          label="Safe arrivals this run"
          value={`${rate}%`}
          tone={rate === 100 ? 'text-board' : 'text-hiviz'}
        />
        <Kpi label="Absent today" value={String(counts.absent)} tone="text-skip" />
      </dl>

      {/* The route as one horizontal line across the whole fleet view */}
      <section className="border-b border-line py-5" aria-label="Route progress">
        <ol className="flex items-start">
          {ROUTE_WAYPOINTS.map((wp, i) => {
            const passed = running && hasPassed(state.bus, state.tripMode, i);
            const isHere = running && heading === i;
            const last = i === SCHOOL_INDEX;
            return (
              <li key={wp.name} className={`relative ${last ? 'shrink-0' : 'flex-1'}`}>
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
                  {wp.name}
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
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`h-8 rounded-xs border px-3 text-[13px] font-medium transition-colors ${
                  filter === f.id
                    ? 'border-hiviz/60 bg-hiviz/10 text-hiviz'
                    : 'border-line text-mute hover:text-chalk'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] text-faint">
                  <th scope="col" className="px-3 py-2 font-medium">Child</th>
                  <th scope="col" className="px-3 py-2 font-medium">Status</th>
                  <th scope="col" className="px-3 py-2 font-medium">Stop</th>
                  <th scope="col" className="px-3 py-2 font-medium">Parent</th>
                  <th scope="col" className="px-3 py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={s.name}
                          src={s.avatarUrl}
                          size={32}
                          dimmed={s.status === 'absent_today'}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[14px] leading-5 font-medium">{s.name}</p>
                          <p className="blind text-[11px] leading-4 text-mute">{s.grade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-3 py-2 text-[13px] leading-5 text-mute">
                      {ROUTE_WAYPOINTS[s.stopIndex].name}
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-[13px] leading-5">{s.parentName}</p>
                      <a
                        href={`tel:${s.parentPhone}`}
                        className="tnum inline-flex items-center gap-1 text-[12px] leading-4 text-mute transition-colors hover:text-hiviz"
                      >
                        <Phone className="size-3" aria-hidden />
                        {s.parentPhone}
                      </a>
                    </td>
                    <td className="tnum px-3 py-2 text-[13px] leading-5 text-faint">
                      {(hydrated && clockTime(s.lastUpdated)) || '—'}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[14px] text-faint">
                      No children in this view yet.
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
