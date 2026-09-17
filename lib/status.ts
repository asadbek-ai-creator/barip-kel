import type { AbsenceReason, StudentStatus } from '@/types';

export interface StatusMeta {
  /** Full label, English with the Karakalpak term alongside. */
  label: string;
  /** Compact label for tight rows and pins. */
  short: string;
  /** Tailwind text colour token. */
  text: string;
  /** Tailwind background token for solid chips. */
  chip: string;
  /** Raw hex, for Leaflet markers built as HTML strings. */
  hex: string;
}

export const STATUS_META: Record<StudentStatus, StatusMeta> = {
  at_home: {
    label: 'Waiting at home (Úyde kútip tur)',
    short: 'Waiting',
    text: 'text-mute',
    chip: 'bg-mute/15 text-mute border-mute/25',
    hex: '#8396b0',
  },
  picked_up: {
    label: 'On the bus (Avtobusta)',
    short: 'On bus',
    text: 'text-board',
    chip: 'bg-board/15 text-board border-board/30',
    hex: '#3ddc97',
  },
  at_school: {
    label: 'Safely at school (Mektepte)',
    short: 'At school',
    text: 'text-school',
    chip: 'bg-school/15 text-school border-school/30',
    hex: '#4cc9f0',
  },
  dropped_off: {
    label: 'Dropped off at home (Úyge jetti)',
    short: 'Home',
    text: 'text-home',
    chip: 'bg-home/15 text-home border-home/30',
    hex: '#c4b5fd',
  },
  absent_today: {
    label: 'Absent today (Búgin joq)',
    short: 'Absent',
    text: 'text-skip',
    chip: 'bg-skip/15 text-skip border-skip/30',
    hex: '#64748b',
  },
};

export const ABSENCE_REASONS: Record<AbsenceReason, string> = {
  sick: 'Sick (Nawqas)',
  parents_driving: 'Parents driving (Ata-ana alıp baradı)',
  vacation: 'Away / holiday (Demalısta)',
};

/** "07:42" in the viewer's locale, or null before hydration. */
export function clockTime(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
