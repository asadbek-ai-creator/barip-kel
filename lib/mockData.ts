import type { AppState, Student, Waypoint } from '@/types';

/** Bus #04 driver — the demo persona shown on the driver screen. */
export const DRIVER = {
  name: 'Jaqsılıq Nurımbetov',
  busNumber: '04',
  phone: '+998907778899',
  plate: '95 A 402 BA',
} as const;

export const SCHOOL_NAME = 'School #1 (1-san mektep)';

/** The parent signed in on /parent, and the children on their account. */
export const PARENT: { name: string; childIds: string[] } = {
  name: 'Timur Dawletov',
  childIds: ['s1', 's2'],
};

/**
 * The morning route: five residential stops around central Nukus, finishing at
 * School #1. The afternoon route is this same list traversed in reverse.
 * Centred on [42.4602, 59.6074].
 */
export const ROUTE_WAYPOINTS: Waypoint[] = [
  {
    id: 'stop1',
    name: 'Stop 1 — Dosnazarov',
    address: 'Dosnazarov kóshesi 12, Nókis',
    coords: [42.4521, 59.5978],
    kind: 'stop',
  },
  {
    id: 'stop2',
    name: 'Stop 2 — Berdaq',
    address: 'Berdaq kóshesi 45, Nókis',
    coords: [42.4558, 59.6021],
    kind: 'stop',
  },
  {
    id: 'stop3',
    name: 'Stop 3 — Qaraqalpaqstan',
    address: 'Qaraqalpaqstan prospekti 88, Nókis',
    coords: [42.4594, 59.6083],
    kind: 'stop',
  },
  {
    id: 'stop4',
    name: 'Stop 4 — Ámiwdárya',
    address: 'Ámiwdárya kóshesi 7, Nókis',
    coords: [42.4641, 59.6142],
    kind: 'stop',
  },
  {
    id: 'stop5',
    name: 'Stop 5 — Qala orayı',
    address: 'Ǵárezsizlik kóshesi 30, Nókis',
    coords: [42.4688, 59.619],
    kind: 'stop',
  },
  {
    id: 'school',
    name: SCHOOL_NAME,
    address: 'Alla Yarov kóshesi 1, Nókis',
    coords: [42.4726, 59.6118],
    kind: 'school',
  },
];

/** Index of the school in ROUTE_WAYPOINTS. */
export const SCHOOL_INDEX = ROUTE_WAYPOINTS.length - 1;
export const SCHOOL = ROUTE_WAYPOINTS[SCHOOL_INDEX];

type SeedStudent = Omit<Student, 'status' | 'tripType' | 'stopCoordinates' | 'stopAddress' | 'avatarUrl'>;

const SEED: SeedStudent[] = [
  {
    id: 's1',
    name: 'Azamat Dawletov',
    grade: '5-A',
    parentName: 'Timur Dawletov',
    parentPhone: '+998901234567',
    stopIndex: 0,
  },
  {
    id: 's2',
    name: 'Nurjamal Dawletova',
    grade: '6-B',
    parentName: 'Timur Dawletov',
    parentPhone: '+998901234567',
    stopIndex: 0,
  },
  {
    id: 's3',
    name: 'Gúlzar Allayarova',
    grade: '4-B',
    parentName: 'Ayzada Allayarova',
    parentPhone: '+998912345678',
    stopIndex: 1,
  },
  {
    id: 's4',
    name: 'Islam Berdimuratov',
    grade: '7-A',
    parentName: 'Murat Berdimuratov',
    parentPhone: '+998933456789',
    stopIndex: 2,
  },
  {
    id: 's5',
    name: 'Dawlet Jumabaev',
    grade: '5-A',
    parentName: 'Polat Jumabaev',
    parentPhone: '+998911122334',
    stopIndex: 2,
  },
  {
    id: 's6',
    name: 'Aysultan Qalibaev',
    grade: '3-C',
    parentName: 'Begis Qalibaev',
    parentPhone: '+998974567890',
    stopIndex: 3,
  },
  {
    id: 's7',
    name: 'Ayjamal Qurbanova',
    grade: '4-A',
    parentName: 'Shiyrin Qurbanova',
    parentPhone: '+998939988776',
    stopIndex: 4,
  },
  {
    id: 's8',
    name: 'Temirbek Ótemuratov',
    grade: '8-B',
    parentName: 'Sarsenbay Ótemuratov',
    parentPhone: '+998972233445',
    stopIndex: 4,
  },
];

function buildStudents(): Student[] {
  return SEED.map((s) => ({
    ...s,
    avatarUrl: `/avatars/${s.id}.svg`,
    stopAddress: ROUTE_WAYPOINTS[s.stopIndex].address,
    stopCoordinates: ROUTE_WAYPOINTS[s.stopIndex].coords,
    status: 'at_home' as const,
    tripType: 'morning' as const,
  }));
}

/**
 * A fresh demo state. Deterministic on purpose — it is rendered on the server
 * and again on the first client render, so it must never read the clock.
 */
export function INITIAL_STATE(): AppState {
  const start = ROUTE_WAYPOINTS[0].coords;
  return {
    students: buildStudents(),
    bus: {
      lat: start[0],
      lng: start[1],
      speed: 0,
      heading: 0,
      currentStopIndex: 0,
    },
    tripMode: 'idle',
    revision: 0,
  };
}
