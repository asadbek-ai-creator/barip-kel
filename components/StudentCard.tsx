'use client';

import { CheckCircle2, LogOut, Phone, UserX } from 'lucide-react';
import type { Student, TripMode } from '@/types';
import { ROUTE_WAYPOINTS } from '@/lib/mockData';
import { STATUS_META } from '@/lib/status';
import { firstName } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/context';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';

interface Props {
  student: Student;
  tripMode: TripMode;
  hydrated: boolean;
  onBoard: () => void;
  onDropOff: () => void;
}

export function StudentCard({ student, tripMode, hydrated, onBoard, onDropOff }: Props) {
  const { t, name, time } = useI18n();

  const absent = student.status === 'absent_today';
  const afternoon = tripMode === 'afternoon_to_home';
  const tripRunning = tripMode === 'morning_to_school' || tripMode === 'afternoon_to_home';

  const canBoard =
    !absent &&
    tripRunning &&
    student.status === (afternoon ? 'at_school' : 'at_home');

  const canDropOff = !absent && tripRunning && student.status === 'picked_up';
  const stamp = hydrated ? time(student.lastUpdated) : null;

  const childName = name(student.id, student.name);
  const parentName = name(`parent.${student.id}`, student.parentName);
  const address = t(`waypoint.${ROUTE_WAYPOINTS[student.stopIndex].id}.address`);

  return (
    <article
      className={`rounded-md border bg-ink-2 transition-colors ${
        absent ? 'border-line-soft bg-ink-2/40' : 'border-line'
      }`}
    >
      <div className="flex gap-3 p-3">
        <Avatar name={childName} src={student.avatarUrl} dimmed={absent} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3
              className={`truncate font-display text-[17px] leading-6 font-semibold ${
                absent ? 'text-faint' : 'text-chalk'
              }`}
            >
              {childName}
            </h3>
            <span className="blind shrink-0 text-[12px] text-hiviz">
              {name(student.grade, student.grade)}
            </span>
          </div>

          <p className="truncate text-[13px] leading-5 text-faint">{address}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={student.status} />
            {stamp ? (
              <span className="tnum text-[12px] text-faint">
                {student.status === 'picked_up'
                  ? t('card.stamp.boarded', { time: stamp })
                  : t('card.stamp.updated', { time: stamp })}
              </span>
            ) : null}
          </div>
        </div>

        <a
          href={`tel:${student.parentPhone}`}
          aria-label={t('card.callParent', { parent: parentName, child: childName })}
          className="grid size-11 shrink-0 place-items-center self-start rounded-sm border border-line text-mute transition-colors hover:border-hiviz/50 hover:text-hiviz"
        >
          <Phone className="size-[18px]" aria-hidden />
        </a>
      </div>

      {absent ? (
        <p className="flex items-center gap-2 border-t border-line-soft px-3 py-2 text-[13px] leading-5 text-skip">
          <UserX className="size-4 shrink-0" aria-hidden />
          <span>
            {student.absenceReason
              ? t('card.absentWithReason', {
                  name: firstName(childName),
                  reason: t(`absence.${student.absenceReason}`),
                })
              : t('card.absent', { name: firstName(childName) })}
          </span>
        </p>
      ) : (
        <div className="flex gap-2 border-t border-line p-2">
          <button
            type="button"
            onClick={onBoard}
            disabled={!canBoard}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-board/15 text-[14px] font-semibold text-board transition-colors enabled:hover:bg-board/25 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-faint"
          >
            <CheckCircle2 className="size-[18px]" aria-hidden />
            {t('card.board')}
          </button>
          <button
            type="button"
            onClick={onDropOff}
            disabled={!canDropOff}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-school/15 text-[14px] font-semibold text-school transition-colors enabled:hover:bg-school/25 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-faint"
          >
            <LogOut className="size-[18px]" aria-hidden />
            {afternoon ? t('card.drop.afternoon') : t('card.drop.morning')}
          </button>
        </div>
      )}
    </article>
  );
}

/** Colour of the pin that represents this student's stop on the map. */
export function stopColour(students: Student[]): string {
  if (students.length === 0) return STATUS_META.at_home.hex;
  if (students.every((s) => s.status === 'absent_today')) return STATUS_META.absent_today.hex;
  const active = students.filter((s) => s.status !== 'absent_today');
  if (active.every((s) => s.status === 'at_school')) return STATUS_META.at_school.hex;
  if (active.every((s) => s.status === 'dropped_off')) return STATUS_META.dropped_off.hex;
  if (active.some((s) => s.status === 'picked_up')) return STATUS_META.picked_up.hex;
  return STATUS_META.at_home.hex;
}
