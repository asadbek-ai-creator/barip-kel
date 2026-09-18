import type { StudentStatus } from '@/types';

export interface StatusMeta {
  /** Tailwind text colour token. */
  text: string;
  /** Tailwind background token for solid chips. */
  chip: string;
  /** Raw hex, for Leaflet markers built as HTML strings. */
  hex: string;
}

/**
 * Colour only. The words live in `lib/i18n` under `status.<status>.label` and
 * `status.<status>.short`, so a status reads in whichever language is on.
 */
export const STATUS_META: Record<StudentStatus, StatusMeta> = {
  at_home: {
    text: 'text-mute',
    chip: 'bg-mute/15 text-mute border-mute/25',
    hex: '#8396b0',
  },
  picked_up: {
    text: 'text-board',
    chip: 'bg-board/15 text-board border-board/30',
    hex: '#3ddc97',
  },
  at_school: {
    text: 'text-school',
    chip: 'bg-school/15 text-school border-school/30',
    hex: '#4cc9f0',
  },
  dropped_off: {
    text: 'text-home',
    chip: 'bg-home/15 text-home border-home/30',
    hex: '#c4b5fd',
  },
  absent_today: {
    text: 'text-skip',
    chip: 'bg-skip/15 text-skip border-skip/30',
    hex: '#64748b',
  },
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
