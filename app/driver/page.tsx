'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bus,
  CircleDot,
  Flag,
  GraduationCap,
  Pause,
  Play,
  Square,
} from 'lucide-react';
import type { SyncEvent } from '@/types';
import { ROUTE_WAYPOINTS, SCHOOL_INDEX, DRIVER } from '@/lib/mockData';
import { bearingDeg, lerpCoord } from '@/lib/geo';
import {
  hasPassed,
  isForward,
  isTripRunning,
  nextWaypointIndex,
  rosterCounts,
  studentsAtStop,
  visitOrder,
} from '@/lib/route';
import { useBusSync } from '@/hooks/useBusSync';
import { useToast } from '@/components/ToastProvider';
import { StudentCard } from '@/components/StudentCard';

const TICK_MS = 3000;
const STEPS_PER_LEG = 4; // 4 ticks per leg, so a leg takes about 12 seconds
const CRUISE_KMH = 26;

export default function DriverPage() {
  const toast = useToast();

  const onRemote = useCallback(
    (event: SyncEvent) => {
      if (event.type === 'STUDENT_ABSENT_TOGGLE' && event.payload.absent) {
        toast({
          title: 'Roster updated',
          body: 'A parent marked their child absent for today.',
          tone: 'alert',
        });
      }
    },
    [toast],
  );

  const { state, hydrated, setStudentStatus, setTripMode, updateBusLocation } =
    useBusSync(onRemote);

  const [direction, setDirection] = useState<'morning' | 'afternoon'>('morning');
  const [simulating, setSimulating] = useState(false);

  const running = isTripRunning(state.tripMode);
  const forward = isForward(state.tripMode);
  const counts = rosterCounts(state);
  const order = useMemo(() => visitOrder(state.tripMode), [state.tripMode]);
  const heading = nextWaypointIndex(state.bus, state.tripMode);

  // Keep the visible toggle in step when another tab starts a run.
  useEffect(() => {
    if (state.tripMode === 'morning_to_school') setDirection('morning');
    if (state.tripMode === 'afternoon_to_home') setDirection('afternoon');
  }, [state.tripMode]);

  // --- drive simulator -----------------------------------------------------
  const sim = useRef({ index: 0, t: 0 });
  const busIndexRef = useRef(state.bus.currentStopIndex);
  busIndexRef.current = state.bus.currentStopIndex;

  useEffect(() => {
    if (!simulating || !running) return;

    const goForward = state.tripMode === 'morning_to_school';
    sim.current = { index: busIndexRef.current, t: 0 };

    const id = window.setInterval(() => {
      const s = sim.current;
      const step = goForward ? 1 : -1;

      s.t += 1 / STEPS_PER_LEG;
      if (s.t >= 1) {
        const arrived = s.index + step;
        if (arrived < 0 || arrived > SCHOOL_INDEX) {
          window.clearInterval(id);
          setSimulating(false);
          setTripMode('completed');
          return;
        }
        s.index = arrived;
        s.t = 0;
      }

      const target = s.index + step;
      const from = ROUTE_WAYPOINTS[s.index].coords;
      const to = (ROUTE_WAYPOINTS[target] ?? ROUTE_WAYPOINTS[s.index]).coords;
      const [lat, lng] = lerpCoord(from, to, s.t);

      updateBusLocation({
        lat,
        lng,
        // t === 0 means the bus has just pulled up at a stop.
        speed: s.t === 0 ? 0 : CRUISE_KMH,
        heading: bearingDeg(from, to),
        currentStopIndex: s.index,
      });
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [simulating, running, state.tripMode, setTripMode, updateBusLocation]);

  // Ending the trip from any tab also stops the wheels here.
  useEffect(() => {
    if (!running && simulating) setSimulating(false);
  }, [running, simulating]);

  const startTrip = () => {
    setTripMode(direction === 'morning' ? 'morning_to_school' : 'afternoon_to_home');
    toast({
      title: direction === 'morning' ? 'Morning run started' : 'Afternoon run started',
      body: 'Parents can now follow Bus 04 live.',
      tone: 'info',
    });
  };

  const endTrip = () => {
    setSimulating(false);
    setTripMode('completed');
  };

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-24">
      <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 pt-3">
          <Link
            href="/"
            aria-label="Back to role switcher"
            className="-ml-1 grid size-8 place-items-center rounded-sm text-faint transition-colors hover:text-chalk"
          >
            <ArrowLeft className="size-[18px]" aria-hidden />
          </Link>
          <span className="blind rounded-xs bg-hiviz px-2 py-0.5 text-[15px] text-ink">
            Bus {DRIVER.busNumber}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] leading-5 font-semibold">{DRIVER.name}</p>
            <p className="tnum truncate text-[12px] leading-4 text-faint">{DRIVER.plate}</p>
          </div>
        </div>

        {/* Destination blind, as on the front of the bus */}
        <p className="blind px-4 pt-2 text-[19px] leading-7 text-hiviz">
          {direction === 'morning' ? 'Nókis → Mektep #1' : 'Mektep #1 → Nókis'}
        </p>

        <div className="flex gap-1 px-4 pt-2 pb-3">
          <SegButton
            active={direction === 'morning'}
            onClick={() => setDirection('morning')}
            disabled={running}
          >
            Morning
          </SegButton>
          <SegButton
            active={direction === 'afternoon'}
            onClick={() => setDirection('afternoon')}
            disabled={running}
          >
            Afternoon
          </SegButton>
        </div>

        <div className="flex gap-2 px-4 pb-3">
          {running ? (
            <button
              type="button"
              onClick={endTrip}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-sm border border-alert/40 bg-alert/10 text-[15px] font-semibold text-alert transition-colors hover:bg-alert/20"
            >
              <Square className="size-[18px]" aria-hidden />
              End trip
            </button>
          ) : (
            <button
              type="button"
              onClick={startTrip}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-hiviz text-[15px] font-semibold text-ink transition-colors hover:bg-hiviz/90"
            >
              <Flag className="size-[18px]" aria-hidden />
              Start trip
            </button>
          )}

          <button
            type="button"
            onClick={() => setSimulating((v) => !v)}
            disabled={!running}
            aria-pressed={simulating}
            className={`flex h-12 items-center justify-center gap-2 rounded-sm border px-4 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:border-line-soft disabled:text-faint ${
              simulating
                ? 'border-board/50 bg-board/15 text-board'
                : 'border-line text-chalk hover:border-hiviz/50'
            }`}
          >
            {simulating ? (
              <Pause className="size-[18px]" aria-hidden />
            ) : (
              <Play className="size-[18px]" aria-hidden />
            )}
            {simulating ? 'Driving' : 'Simulate'}
          </button>
        </div>
      </header>

      {!running ? (
        <p className="mx-4 mt-4 rounded-md border border-line bg-ink-2 p-3 text-[13px] leading-5 text-mute">
          {state.tripMode === 'completed'
            ? 'Run finished. Switch direction and start the next trip when you are ready.'
            : 'Start the trip to open the roster. Parents see the bus move the moment you do.'}
        </p>
      ) : null}

      {/* The route drawn as a line, with the roster hanging off each stop */}
      <ol className="relative mt-4 px-4">
        <span
          className="absolute top-3 bottom-3 left-8 w-px bg-line"
          aria-hidden
        />

        {order.map((stopIndex) => {
          const wp = ROUTE_WAYPOINTS[stopIndex];
          const kids = studentsAtStop(state.students, stopIndex);
          const passed = running && hasPassed(state.bus, state.tripMode, stopIndex);
          const isHere = running && heading === stopIndex;
          const isSchool = wp.kind === 'school';

          return (
            <li key={stopIndex} className="relative pb-6 pl-11">
              <span
                className={`absolute top-1 left-0 grid size-8 place-items-center rounded-full border-2 bg-ink transition-colors ${
                  isHere
                    ? 'border-hiviz text-hiviz'
                    : passed
                      ? 'border-board/60 text-board/70'
                      : 'border-line text-faint'
                }`}
                aria-hidden
              >
                {isSchool ? (
                  <GraduationCap className="size-4" />
                ) : (
                  <CircleDot className="size-4" />
                )}
              </span>

              {isHere ? (
                <span
                  className="absolute top-[-14px] left-[3px] grid size-[26px] place-items-center rounded-full bg-hiviz text-ink shadow-[0_0_0_4px_var(--color-ink)]"
                  aria-hidden
                >
                  <Bus className="size-4" />
                </span>
              ) : null}

              <div className="flex items-baseline justify-between gap-2 pt-1">
                <h2 className="font-display text-[16px] leading-6 font-semibold">
                  {wp.name}
                </h2>
                {isHere ? (
                  <span className="blind shrink-0 text-[12px] text-hiviz">Next</span>
                ) : null}
              </div>
              <p className="text-[13px] leading-5 text-faint">{wp.address}</p>

              {kids.length > 0 ? (
                <div className="mt-2.5 space-y-2">
                  {kids.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      tripMode={state.tripMode}
                      hydrated={hydrated}
                      onBoard={() => {
                        setStudentStatus(student.id, 'picked_up');
                        toast({
                          title: `${student.name.split(' ')[0]} is on board`,
                          body: 'The parent has been notified.',
                          tone: 'board',
                        });
                      }}
                      onDropOff={() =>
                        setStudentStatus(
                          student.id,
                          state.tripMode === 'afternoon_to_home'
                            ? 'dropped_off'
                            : 'at_school',
                        )
                      }
                    />
                  ))}
                </div>
              ) : isSchool ? (
                <p className="mt-2 text-[13px] leading-5 text-mute">
                  End of the {forward ? 'morning' : 'afternoon'} route.
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 backdrop-blur">
        <dl className="mx-auto grid max-w-md grid-cols-4 divide-x divide-line">
          <Tally label="Total" value={counts.total} />
          <Tally label="Boarded" value={counts.boarded} tone="text-board" />
          <Tally label="Absent" value={counts.absent} tone="text-skip" />
          <Tally label="Remaining" value={counts.remaining} tone="text-hiviz" />
        </dl>
      </div>
    </main>
  );
}

function SegButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`h-9 flex-1 rounded-sm border text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? 'border-hiviz/60 bg-hiviz/15 text-hiviz'
          : 'border-line text-mute hover:text-chalk'
      }`}
    >
      {children}
    </button>
  );
}

function Tally({
  label,
  value,
  tone = 'text-chalk',
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="px-2 py-2.5 text-center">
      <dd className={`tnum font-display text-[22px] leading-7 font-bold ${tone}`}>
        {value}
      </dd>
      <dt className="text-[11px] leading-4 text-faint">{label}</dt>
    </div>
  );
}
