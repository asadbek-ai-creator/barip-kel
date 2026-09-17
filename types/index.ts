export type StudentStatus =
  | 'at_home'
  | 'picked_up'
  | 'at_school'
  | 'absent_today'
  | 'dropped_off';

export type AbsenceReason = 'sick' | 'parents_driving' | 'vacation';

export interface Student {
  id: string;
  name: string;
  grade: string;
  avatarUrl: string;
  parentName: string;
  parentPhone: string;
  stopAddress: string;
  stopCoordinates: [number, number]; // [lat, lng]
  /** Index into ROUTE_WAYPOINTS for this student's stop. */
  stopIndex: number;
  status: StudentStatus;
  tripType: 'morning' | 'afternoon';
  lastUpdated?: string;
  absenceReason?: AbsenceReason;
}

export interface BusLocation {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  currentStopIndex: number;
}

export type TripMode =
  | 'idle'
  | 'morning_to_school'
  | 'afternoon_to_home'
  | 'completed';

export interface Waypoint {
  name: string;
  address: string;
  coords: [number, number];
  kind: 'stop' | 'school';
}

/** The complete shared demo state, mirrored into every open tab. */
export interface AppState {
  students: Student[];
  bus: BusLocation;
  tripMode: TripMode;
  /** Monotonic counter used to resolve snapshot races between tabs. */
  revision: number;
}

export type SyncEvent =
  | { type: 'BUS_LOCATION_UPDATE'; payload: BusLocation }
  | {
      type: 'STUDENT_STATUS_CHANGE';
      payload: { studentId: string; status: StudentStatus; at: string };
    }
  | { type: 'TRIP_STATE_CHANGE'; payload: { mode: TripMode } }
  | {
      type: 'STUDENT_ABSENT_TOGGLE';
      payload: {
        studentId: string;
        absent: boolean;
        reason?: AbsenceReason;
        at: string;
      };
    }
  | { type: 'RESET_DEMO' }
  | { type: 'STATE_REQUEST' }
  | { type: 'STATE_SNAPSHOT'; payload: AppState };

/** Envelope actually put on the wire, so a tab can ignore its own echo. */
export interface SyncMessage {
  senderId: string;
  event: SyncEvent;
}
