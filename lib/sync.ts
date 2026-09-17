import type { AppState, Student, SyncEvent, SyncMessage } from '@/types';
import { INITIAL_STATE, ROUTE_WAYPOINTS, SCHOOL_INDEX } from './mockData';

export const CHANNEL_NAME = 'safebus_bus_channel';
export const STORAGE_KEY = 'safebus_state_v1';

/* ------------------------------------------------------------------ *
 * Reducer — the single source of truth for every state transition.
 * Every tab runs the same reducer over the same event stream, so the
 * tabs converge without ever shipping whole-state updates around.
 * ------------------------------------------------------------------ */

export function reducer(state: AppState, event: SyncEvent): AppState {
  switch (event.type) {
    case 'BUS_LOCATION_UPDATE':
      return { ...state, bus: event.payload, revision: state.revision + 1 };

    case 'STUDENT_STATUS_CHANGE': {
      const { studentId, status, at } = event.payload;
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                status,
                lastUpdated: at,
                absenceReason:
                  status === 'absent_today' ? s.absenceReason : undefined,
              }
            : s,
        ),
        revision: state.revision + 1,
      };
    }

    case 'STUDENT_ABSENT_TOGGLE': {
      const { studentId, absent, reason, at } = event.payload;
      return {
        ...state,
        students: state.students.map((s) => {
          if (s.id !== studentId) return s;
          if (absent) {
            return {
              ...s,
              status: 'absent_today' as const,
              absenceReason: reason,
              lastUpdated: at,
            };
          }
          return {
            ...s,
            status:
              state.tripMode === 'afternoon_to_home'
                ? ('at_school' as const)
                : ('at_home' as const),
            absenceReason: undefined,
            lastUpdated: at,
          };
        }),
        revision: state.revision + 1,
      };
    }

    case 'TRIP_STATE_CHANGE': {
      const mode = event.payload.mode;
      let students = state.students;
      let bus = state.bus;

      // Starting a run resets the roster for that direction. Children whose
      // parents marked them absent stay absent for the whole day.
      if (mode === 'morning_to_school' || mode === 'afternoon_to_home') {
        const morning = mode === 'morning_to_school';
        const startIndex = morning ? 0 : SCHOOL_INDEX;
        const start = ROUTE_WAYPOINTS[startIndex].coords;

        students = state.students.map<Student>((s) => ({
          ...s,
          tripType: morning ? 'morning' : 'afternoon',
          status:
            s.status === 'absent_today'
              ? 'absent_today'
              : morning
                ? 'at_home'
                : 'at_school',
        }));

        bus = {
          lat: start[0],
          lng: start[1],
          speed: 0,
          heading: 0,
          currentStopIndex: startIndex,
        };
      }

      return { ...state, tripMode: mode, students, bus, revision: state.revision + 1 };
    }

    case 'STATE_SNAPSHOT':
      // Only accept a peer's snapshot if it is genuinely newer than ours.
      return event.payload.revision > state.revision ? event.payload : state;

    case 'RESET_DEMO':
      return INITIAL_STATE();

    case 'STATE_REQUEST':
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ *
 * Persistence — localStorage is the fallback channel and the reason a
 * reloaded tab keeps its place in the demo.
 * ------------------------------------------------------------------ */

export function readPersisted(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.students) || !parsed.bus) return null;
    return parsed;
  } catch {
    return null; // private mode, quota, or corrupt payload — start fresh
  }
}

export function writePersisted(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* non-fatal: the BroadcastChannel still carries the demo */
  }
}

/* ------------------------------------------------------------------ *
 * Channel
 * ------------------------------------------------------------------ */

let channel: BroadcastChannel | null = null;

export function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function isSyncMessage(data: unknown): data is SyncMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'senderId' in data &&
    'event' in data
  );
}
