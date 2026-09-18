'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Phone, TriangleAlert, UserX } from 'lucide-react';
import type { AbsenceReason, Student, SyncEvent } from '@/types';
import { DRIVER, PARENT, ROUTE_WAYPOINTS, SCHOOL, SCHOOL_INDEX } from '@/lib/mockData';
import { etaMinutes } from '@/lib/geo';
import { hasPassed, isTripRunning, legProgress, metersToWaypoint } from '@/lib/route';
import { STATUS_META } from '@/lib/status';
import { useBusSync } from '@/hooks/useBusSync';
import { useToast } from '@/components/ToastProvider';
import { BusMap, type MapPin } from '@/components/BusMap';
import { SkipTripModal } from '@/components/SkipTripModal';
import { Avatar } from '@/components/Avatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { firstName } from '@/lib/i18n';
import { useI18n, type I18n } from '@/lib/i18n/context';

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
  const i18n = useI18n();
  const { t, tn, name } = i18n;

  const [childId, setChildId] = useState<string>(PARENT.childIds[0]);
  const [skipOpen, setSkipOpen] = useState(false);

  const childIdRef = useRef(childId);
  childIdRef.current = childId;

  // Alerts a parent actually cares about, raised only for changes made elsewhere.
  const onRemote = useCallback(
    (event: SyncEvent) => {
      if (event.type !== 'STUDENT_STATUS_CHANGE') return;
      if (event.payload.studentId !== childIdRef.current) return;

      const copy: Partial<
        Record<string, { title: string; body: string; tone: 'board' | 'school' | 'info' }>
      > = {
        picked_up: {
          title: t('parent.toast.boarded.title', { number: DRIVER.busNumber }),
          body: t('parent.toast.boarded.body'),
          tone: 'board',
        },
        at_school: {
          title: t('parent.toast.atSchool.title'),
          body: t('parent.toast.atSchool.body'),
          tone: 'school',
        },
        dropped_off: {
          title: t('parent.toast.droppedOff.title'),
          body: t('parent.toast.droppedOff.body'),
          tone: 'info',
        },
      };

      const notice = copy[event.payload.status];
      if (notice) toast(notice);
    },
    [toast, t],
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
      title: t('parent.toast.nearly.title', { number: DRIVER.busNumber }),
      body: t('parent.toast.nearly.body'),
      tone: 'info',
    });
  }, [child, phase, eta, state.tripMode, toast, t]);

  const pins: MapPin[] = useMemo(() => {
    if (!child) return [];
    return [
      {
        id: 'home',
        glyph: 'H',
        coords: child.stopCoordinates,
        title: t('parent.pin.home'),
        subtitle: t(`waypoint.${ROUTE_WAYPOINTS[child.stopIndex].id}.address`),
        color: STATUS_META.dropped_off.hex,
      },
      {
        id: 'school',
        glyph: 'S',
        coords: SCHOOL.coords,
        title: t('waypoint.school.name'),
        subtitle: t('waypoint.school.address'),
        color: STATUS_META.at_school.hex,
      },
    ];
  }, [child, t]);

  const route = useMemo(() => ROUTE_WAYPOINTS.map((w) => w.coords), []);

  if (!child) return null;

  const absent = child.status === 'absent_today';
  const childName = name(child.id, child.name);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-8">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link
          href="/"
          aria-label={t('common.back')}
          className="-ml-1 grid size-8 place-items-center rounded-sm text-faint transition-colors hover:text-chalk"
        >
          <ArrowLeft className="size-[18px]" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] leading-5 font-semibold">
            {name('parent.me', PARENT.name)}
          </p>
          <p className="truncate text-[12px] leading-4 text-faint">
            {t('parent.childrenOnBus', {
              children: tn('count.children', children.length),
              number: DRIVER.busNumber,
            })}
          </p>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Child switcher */}
      <div className="flex gap-2 px-4 py-3">
        {children.map((c) => {
          const active = c.id === child.id;
          const label = name(c.id, c.name);
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
              <Avatar name={label} src={c.avatarUrl} size={34} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] leading-5 font-semibold">
                  {firstName(label)}
                </span>
                <span className="blind block text-[11px] leading-4 text-mute">
                  {name(c.grade, c.grade)}
                </span>
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
        i18n={i18n}
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
        i18n={i18n}
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
          {absent ? t('parent.unskip') : t('parent.skip')}
        </button>

        <a
          href={`tel:${DRIVER.phone}`}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-hiviz text-[15px] font-semibold text-ink transition-colors hover:bg-hiviz/90"
        >
          <Phone className="size-[18px]" aria-hidden />
          {t('parent.callDriver')}
        </a>
      </div>

      <p className="px-4 pt-3 text-[12px] leading-5 text-faint">
        {t('parent.footer', {
          name: name('driver', DRIVER.name),
          number: DRIVER.busNumber,
          plate: DRIVER.plate,
        })}
      </p>

      <SkipTripModal
        open={skipOpen}
        studentName={childName}
        onClose={() => setSkipOpen(false)}
        onConfirm={(reason: AbsenceReason) => {
          toggleAbsent(child.id, true, reason);
          setSkipOpen(false);
          toast({
            title: t('parent.toast.skip.title'),
            body: t('parent.toast.skip.body', { name: firstName(childName) }),
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
  i18n,
}: {
  phase: Phase;
  child: Student;
  eta: number;
  stopsAway: number;
  hydrated: boolean;
  afternoon: boolean;
  i18n: I18n;
}) {
  const { t, tn, name, time } = i18n;
  const stamp = hydrated ? time(child.lastUpdated) : null;
  const first = firstName(name(child.id, child.name));

  const shell = 'mx-4 rounded-md border p-4';

  if (phase === 'on_the_way') {
    return (
      <section className={`${shell} border-hiviz/40 bg-hiviz/[0.07]`}>
        <p className="blind text-[13px] text-hiviz">{t('slab.onTheWay.kicker')}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="tnum font-display text-[56px] leading-[1] font-bold text-hiviz">
            {eta === 0 ? t('common.now') : eta}
          </span>
          {eta === 0 ? null : (
            <span className="font-display text-[20px] leading-7 text-hiviz/80">
              {t('common.min')}
            </span>
          )}
        </div>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {eta === 0
            ? t('slab.onTheWay.here')
            : t('slab.onTheWay.away', {
                stops: tn('count.stops', stopsAway),
                name: first,
              })}
        </p>
      </section>
    );
  }

  if (phase === 'on_bus') {
    return (
      <section className={`${shell} border-board/40 bg-board/[0.07]`}>
        <p className="blind text-[13px] text-board">{t('slab.onBus.kicker')}</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
          {t('slab.onBus.title', { name: first, number: DRIVER.busNumber })}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {stamp ? t('slab.onBus.at', { time: stamp }) : t('slab.onBus.plain')}{' '}
          {afternoon && eta > 0 ? t('slab.onBus.home', { eta }) : ''}
        </p>
      </section>
    );
  }

  if (phase === 'at_school') {
    return (
      <section className={`${shell} border-school/40 bg-school/[0.07]`}>
        <p className="blind text-[13px] text-school">{t('slab.atSchool.kicker')}</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
          {t('slab.atSchool.title', { name: first })}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {stamp ? t('slab.atSchool.at', { time: stamp }) : t('slab.atSchool.plain')}
        </p>
      </section>
    );
  }

  if (phase === 'home_safe') {
    return (
      <section className={`${shell} border-home/40 bg-home/[0.07]`}>
        <p className="blind text-[13px] text-home">{t('slab.homeSafe.kicker')}</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
          {t('slab.homeSafe.title', { name: first })}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-mute">
          {stamp ? t('slab.homeSafe.at', { time: stamp }) : t('slab.homeSafe.plain')}
        </p>
      </section>
    );
  }

  if (phase === 'missed_return') {
    return (
      <section className={`${shell} border-alert/50 bg-alert/[0.1]`}>
        <p className="blind flex items-center gap-1.5 text-[13px] text-alert">
          <TriangleAlert className="size-4" aria-hidden />
          {t('slab.missed.kicker')}
        </p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold text-alert">
          {t('slab.missed.title', { name: first })}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-chalk/80">{t('slab.missed.body')}</p>
      </section>
    );
  }

  if (phase === 'absent') {
    return (
      <section className={`${shell} border-line bg-ink-2`}>
        <p className="blind text-[13px] text-skip">{t('slab.absent.kicker')}</p>
        <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold text-mute">
          {t('slab.absent.title', { name: first })}
        </h2>
        <p className="mt-1 text-[14px] leading-5 text-faint">
          {child.absenceReason
            ? t(`absence.${child.absenceReason}`)
            : t('slab.absent.plain')}
        </p>
      </section>
    );
  }

  return (
    <section className={`${shell} border-line bg-ink-2`}>
      <p className="blind text-[13px] text-mute">{t('slab.noTrip.kicker')}</p>
      <h2 className="mt-1 font-display text-[26px] leading-8 font-semibold">
        {child.status === 'at_school'
          ? t('slab.noTrip.atSchool', { name: first })
          : t('slab.noTrip.atHome', { name: first })}
      </h2>
      <p className="mt-1 text-[14px] leading-5 text-faint">
        {t('slab.noTrip.body', { number: DRIVER.busNumber })}
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
  i18n,
}: {
  busIndex: number;
  progress: number;
  afternoon: boolean;
  running: boolean;
  homeIndex: number;
  i18n: I18n;
}) {
  const { t } = i18n;
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
        <span>
          {afternoon ? t('parent.progress.school') : t('parent.progress.firstStop')}
        </span>
        <span>
          {afternoon ? t('parent.progress.lastStop') : t('parent.progress.schoolName')}
        </span>
      </div>
    </div>
  );
}
