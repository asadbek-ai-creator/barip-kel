import type { AppState, BusLocation, Student, TripMode } from '@/types';
import { ROUTE_WAYPOINTS, SCHOOL_INDEX } from './mockData';
import { haversineMeters, routeDistanceMeters, type Coord } from './geo';

export const WAYPOINT_COORDS: Coord[] = ROUTE_WAYPOINTS.map((w) => w.coords);

export function isTripRunning(mode: TripMode): boolean {
  return mode === 'morning_to_school' || mode === 'afternoon_to_home';
}

/** True when the bus is driving from the stops towards the school. */
export function isForward(mode: TripMode): boolean {
  return mode !== 'afternoon_to_home';
}

/** Waypoint indices in the order this trip visits them. */
export function visitOrder(mode: TripMode): number[] {
  const forward = isForward(mode);
  const all = ROUTE_WAYPOINTS.map((_, i) => i);
  return forward ? all : [...all].reverse();
}

/** The waypoint the bus is heading towards, or null once the route is done. */
export function nextWaypointIndex(bus: BusLocation, mode: TripMode): number | null {
  const step = isForward(mode) ? 1 : -1;
  const next = bus.currentStopIndex + step;
  if (next < 0 || next > SCHOOL_INDEX) return null;
  return next;
}

/** 0–1 progress along the leg the bus is currently driving. */
export function legProgress(bus: BusLocation, mode: TripMode): number {
  const next = nextWaypointIndex(bus, mode);
  if (next === null) return 1;
  const from = WAYPOINT_COORDS[bus.currentStopIndex];
  const to = WAYPOINT_COORDS[next];
  const legLength = haversineMeters(from, to);
  if (legLength < 1) return 0;
  return Math.min(1, haversineMeters(from, [bus.lat, bus.lng]) / legLength);
}

/** Metres the bus still has to drive to reach a given waypoint. */
export function metersToWaypoint(bus: BusLocation, targetIndex: number): number {
  return routeDistanceMeters(
    [bus.lat, bus.lng],
    bus.currentStopIndex,
    targetIndex,
    WAYPOINT_COORDS,
  );
}

/** Has the bus already driven past this stop on the current run? */
export function hasPassed(bus: BusLocation, mode: TripMode, stopIndex: number): boolean {
  return isForward(mode)
    ? bus.currentStopIndex > stopIndex
    : bus.currentStopIndex < stopIndex;
}

export function studentsAtStop(students: Student[], stopIndex: number): Student[] {
  return students.filter((s) => s.stopIndex === stopIndex);
}

export interface RosterCounts {
  total: number;
  boarded: number;
  absent: number;
  remaining: number;
  completed: number;
}

export function rosterCounts(state: AppState): RosterCounts {
  const { students, tripMode } = state;
  const doneStatus = tripMode === 'afternoon_to_home' ? 'dropped_off' : 'at_school';

  const boarded = students.filter((s) => s.status === 'picked_up').length;
  const absent = students.filter((s) => s.status === 'absent_today').length;
  const completed = students.filter((s) => s.status === doneStatus).length;

  return {
    total: students.length,
    boarded,
    absent,
    completed,
    remaining: Math.max(0, students.length - boarded - absent - completed),
  };
}

/** Share of expected children that reached their destination this run. */
export function safeArrivalRate(state: AppState): number {
  const { students, tripMode } = state;
  const doneStatus = tripMode === 'afternoon_to_home' ? 'dropped_off' : 'at_school';
  const expected = students.filter((s) => s.status !== 'absent_today');
  if (expected.length === 0) return 100;
  const arrived = expected.filter((s) => s.status === doneStatus).length;
  return Math.round((arrived / expected.length) * 100);
}
