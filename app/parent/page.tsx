'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Phone, TriangleAlert, UserX } from 'lucide-react';
import type { AbsenceReason, Student, SyncEvent } from '@/types';
import { DRIVER, PARENT, ROUTE_WAYPOINTS, SCHOOL, SCHOOL_INDEX } from '@/lib/mockData';
import { etaMinutes } from '@/lib/geo';
import { hasPassed, isTripRunning, legProgress, metersToWaypoint } from '@/lib/route';
import { ABSENCE_REASONS, STATUS_META, clockTime } from '@/lib/status';
import { useBusSync } from '@/hooks/useBusSync';
import { useToast } from '@/components/ToastProvider';
import { BusMap, type MapPin } from '@/components/BusMap';
import { SkipTripModal } from '@/components/SkipTripModal';
import { Avatar } from '@/components/Avatar';

type Phase =
  | 'absent'
  | 'no_trip'
  | 'on_the_way'
  | 'on_bus'
  | 'at_school'
  | 'home_safe'
  | 'missed_return';

export default function ParentPage() {
  const toast = useToast();
  const [childId, setChildId] = useState<string>(PARENT.childIds[0]);
  const [skipOpen, setSkipOpen] = useState(false);

  const childIdRef = useRef(childId);
  childIdRef.current = childId;

  // Alerts a parent actually cares about, raised only for changes made elsewhere.
  const onRemote = useCallback(
    (event: SyncEvent) => {
      if (event.type !== 'STUDENT_STATUS_CHANGE') return;
      if (event.payload.studentId !== childIdRef.current) return;

      const copy: Partial<Record<string, { title: string; body: string; tone: 'board' | 'school' | 'info' }>> =
        {
          picked_up: {
            title: `Your child has safely boarded Bus ${DRIVER.busNumber}`,
            body: 'You can follow the bus on the map below.',
            tone: 'board',
          },
          at_school: {
            title: 'Arrived at School #1',
            body: 'Your child is safely at school.',
            tone: 'school',
          },
          dropped_off: {
            title: 'Dropped off at your stop',
            body: 'Your child is off the bus and home.',
            tone: 'info',
          },
        };

      const t = copy[event.payload.status];
      if (t) toast(t);
    },
    [toast],
  );

  const { state, hydrated, toggleAbsent } = useBusSync(onRemote);

  const children = useMemo(
    () => state.students.filter((s) => PARENT.childIds.includes(s.id)),
    [state.students],
  );
  const child = children.find((c) => c.id === childId) ?? children[0];

  const running = isTripRunning(state.tripMode);
  const afternoon = state.tripMode === 'afternoon_to_home';

  const metersToChild = child ? metersToWaypoint(state.bus, child.stopIndex) : 0;
  const eta = etaMinutes(metersToChild, state.bus.speed);
  const stopsAway = child ? Math.abs(child.stopIndex - state.bus.currentStopIndex) : 0;

  const phase = getPhase(child, state.tripMode, () =>
    child ? hasPassed(state.bus, state.tripMode, child.stopIndex) : false,
  );

  // Warn once per run when the bus gets close, the way a real push would.
  const warned = useRef<string>('');
  useEffect(() => {
    if (!child || phase !== 'on_the_way' || eta > 2) return;
    const key = `${state.tripMode}:${child.id}`;
    if (warned.current === key) return;
    warned.current = key;
    toast({
      title: `Bus ${DRIVER.busNumber} is nearly at your stop`,
      body: 'Please be ready outside in about two minutes.',
      tone: 'info',
    });
  }, [child, phase, eta, state.tripMode, toast]);

  const pins: MapPin[] = useMemo(() => {
    if (!child) return [];
    return [
      {
        id: 'home',
        glyph: 'H',
        coords: child.stopCoordinates,
        title: 'Your stop',
        subtitle: child.stopAddress,
        color: STATUS_META.dropped_off.hex,
      },
      {
        id: 'school',
        glyph: 'S',
        coords: SCHOOL.coords,
        title: SCHOOL.name,
        subtitle: SCHOOL.address,
        color: STATUS_META.at_school.hex,
      },
    ];
  }, [child]);

  const route = useMemo(() => ROUTE_WAYPOINTS.map((w) => w.coords), []);

  if (!child) return null;

  const absent = child.status === 'absent_today';

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-8">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link
          href="/"
          aria-label="Back to role switcher"
          className="-ml-1 grid size-8 place-items-center rounded-sm text-faint transition-colors hover:text-chalk"
        >
          <ArrowLeft className="size-[18px]" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] leading-5 font-semibold">{PARENT.name}</p>
          <p className="truncate text-[12px] leading-4 text-faint">
            {children.length} children on Bus {DRIVER.busNumber}
          </p>
        </div>
      </header>

      {/* Child switcher */}
      <div className="flex gap-2 px-4 py-3">
        {children.map((c) => {
          const active = c.id === child.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setChildId(c.id)}
              aria-pressed={active}
              className={`flex flex-1 items-center gap-2.5 rounded-sm border p-2 text-left transition-colors ${
                active ? 'border-hiviz/60 bg-hiviz/10' : 'border-line hover:border-mute/40'
              }`}
            >
              <Avatar name={c.name} src={c.avatarUrl} size={34} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] leading-5 font-semibold">
                  {c.name.split(' ')[0]}
                </span>
                <span className="blind block text-[11px] leading-4 text-mute">{c.grade}</span>
              </span>
            </button>
          );
        })}
      </div>

      <StatusSlab
        phase={phase}
        child={child}
        eta={eta}
        stopsAway={stopsAway}
        hydrated={hydrated}
        afternoon={afternoon}
      />

      {/* Live map */}
      <div className="mx-4 mt-3 h-64 overflow-hidden rounded-md border border-line">
        <BusMap bus={state.bus} pins={pins} route={route} follow={running} />
      </div>

      <ProgressStrip
        busIndex={state.bus.currentStopIndex}
        progress={legProgress(state.bus, state.tripMode)}
        afternoon={afternoon}
        running={running}
        homeIndex={child.stopIndex}
      />

      {/* Actions */}
      <div className="mt-4 flex gap-2 px-4">
        <button
          type="button"
          onClick={() => (absent ? toggleAbsent(child.id, false) : setSkipOpen(true))}
          className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-sm border text-[15px] font-semibold transition-colors ${
            absent
              ? 'border-board/40 bg-board/10 text-board hover:bg-board/20'
              : 'border-line text-chalk hover:border-hiviz/50'
          }`}
        >
          <UserX className="size-[18px]" aria-hidden />
          {absent ? 'Riding after all' : 'Skip bus today'}
        </button>

        <a
          href={`tel:${DRIVER.phone}`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-hiviz text-[15px] font-semibold text-ink transition-colors hover:bg-hiviz/90"
        >
          <Phone className="size-[18px]" aria-hidden />
          Call driver
        </a>
      </div>

      <p className="px-4 pt-3 text-[12px] leading-5 text-faint">
        Driver {DRIVER.name} · Bus {DRIVER.busNumber} · {DRIVER.plate}
      </p>

      <SkipTripModal
        open={skipOpen}
        studentName={child.name}
        onClose={() => setSkipOpen(false)}
        onConfirm={(reason: AbsenceReason) => {
          toggleAbsent(child.id, true, reason);
          setSkipOpen(false);
          toast({
            title: 'Driver notified',
            body: `${child.name.split(' ')[0]} is marked absent for today.`,
            tone: 'info',
          });
        }}
      />
    </main>
  );
}

function getPhase(
  child: Student | undefined,
  tripMode: string,
  busPassedStop: () => boolean,
): Phase {
  if (!child) return 'no_trip';
  if (child.status === 'absent_today') return 'absent';
  if (child.status === 'picked_up') return 'on_bus';
  if (child.status === 'dropped_off') return 'home_safe';

  if (child.status === 'at_school') {
    // The one alarm worth raising: the return bus has gone by and the child
    // never got on it.
    if (tripMode === 'afternoon_to_home' && busPassedStop()) return 'missed_return';
    return 'at_school';
  }

  if (tripMode === 'morning_to_school' || tripMode === 'afternoon_to_home') {
    return 'on_the_way';
  }
  return 'no_trip';
}

function StatusSlab({
  phase,
  child,
  eta,
  stopsAway,
  hydrated,
  afternoon,
}: {
  phase: Phase;
  child: Student;
  eta: number;
  stopsAway: number;
  hydrated: boolean;
  afternoon: boolean;
}) {
  const stamp = hydrated ? clockTime(child.lastUpdated) : null;
  const first = child.name.split(' ')[0];

  const shell =
    'mx-4 rounded-md border p-4';

  if (phase === 'on_the_way') {
    return (
      <section className={`${shell} border-hiviz/40 bg-hiviz/[0.07]`}>
        <p className="blind text-[13px] text-hiviz">Bus on the way</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="tnum font-display text-[56px] leading-[1] font-bold text-hiviz">
            {eta === 0 ? 'Now' : eta}
          </span>
          {eta === 0 ? null : (
            <span className="font-display text-[20px] leading-7 text-hiviz/80">min</span>
          )}
        </div>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {eta === 0
            ? 'At your stop right now.'
            : `${stopsAway} ${stopsAway === 1 ? 'stop' : 'stops'} away from ${first}.`}
        </p>
      </section>
    );
  }

  if (phase === 'on_bus') {
    return (
      <section className={`${shell} border-board/40 bg-board/[0.07]`}>
        <p className="blind text-[13px] text-board">On board</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
          {first} is on Bus {DRIVER.busNumber}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {stamp ? `Boarded at ${stamp}.` : 'Boarded.'}{' '}
          {afternoon && eta > 0 ? `Home in about ${eta} min.` : ''}
        </p>
      </section>
    );
  }

  if (phase === 'at_school') {
    return (
      <section className={`${shell} border-school/40 bg-school/[0.07]`}>
        <p className="blind text-[13px] text-school">At school</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
          {first} is safely at school
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {stamp ? `Arrived at ${stamp}.` : 'Arrived.'}
        </p>
      </section>
    );
  }

  if (phase === 'home_safe') {
    return (
      <section className={`${shell} border-home/40 bg-home/[0.07]`}>
        <p className="blind text-[13px] text-home">Home</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
          {first} is off the bus
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {stamp ? `Dropped off at ${stamp}.` : 'Dropped off at your stop.'}
        </p>
      </section>
    );
  }

  if (phase === 'missed_return') {
    return (
      <section className={`${shell} border-alert/50 bg-alert/[0.1]`}>
        <p className="blind flex items-center gap-1.5 text-[13px] text-alert">
          <TriangleAlert className="size-4" aria-hidden />
          Not on the return bus
        </p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold text-alert">
          {first} did not board
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-chalk/80">
          The bus has already passed your stop. Call the driver or the school now.
        </p>
      </section>
    );
  }

  if (phase === 'absent') {
    return (
      <section className={`${shell} border-line bg-ink-2`}>
        <p className="blind text-[13px] text-skip">Not riding today</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold text-mute">
          {first} is marked absent
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-faint">
          {child.absenceReason ? ABSENCE_REASONS[child.absenceReason] : 'The driver has been told.'}
        </p>
      </section>
    );
  }

  return (
    <section className={`${shell} border-line bg-ink-2`}>
      <p className="blind text-[13px] text-mute">No trip running</p>
      <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
        {first} is at {child.status === 'at_school' ? 'school' : 'home'}
      </h2>
      <p className="mt-1 text-[14px] leading-5 text-faint">
        You will be alerted the moment Bus {DRIVER.busNumber} sets off.
      </p>
    </section>
  );
}

/** Home → school as a single line, with the bus riding it. */
function ProgressStrip({
  busIndex,
  progress,
  afternoon,
  running,
  homeIndex,
}: {
  busIndex: number;
  progress: number;
  afternoon: boolean;
  running: boolean;
  homeIndex: number;
}) {
  const travelled = afternoon
    ? SCHOOL_INDEX - (busIndex - progress)
    : busIndex + progress;
  const pct = Math.max(0, Math.min(100, (travelled / SCHOOL_INDEX) * 100));
  const homePct = ((afternoon ? SCHOOL_INDEX - homeIndex : homeIndex) / SCHOOL_INDEX) * 100;

  return (
    <div className="mx-4 mt-3">
      <div className="relative h-9">
        <span className="absolute top-4 right-0 left-0 h-px bg-line" aria-hidden />
        <span
          className="absolute top-4 left-0 h-px bg-hiviz/70"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
        <span
          className="absolute top-[13px] size-2 -translate-x-1/2 rounded-full bg-home"
          style={{ left: `${homePct}%` }}
          aria-hidden
        />
        {running ? (
          <span
            className="spine-token absolute top-[7px] size-[18px] -translate-x-1/2 rounded-full bg-hiviz shadow-[0_0_0_4px_var(--color-ink)]"
            style={{ left: `${pct}%` }}
            aria-hidden
          />
        ) : null}
      </div>
      <div className="flex justify-between text-[12px] leading-4 text-faint">
        <span>{afternoon ? 'School' : 'First stop'}</span>
        <span>{afternoon ? 'Last stop' : 'School #1'}</span>
      </div>
    </div>
  );
}
