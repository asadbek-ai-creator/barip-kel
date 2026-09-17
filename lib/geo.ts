export type Coord = [number, number]; // [lat, lng]

const R = 6371000; // Earth radius, metres
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance between two [lat, lng] points, in metres. */
export function haversineMeters(a: Coord, b: Coord): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from a to b, in degrees clockwise from north. */
export function bearingDeg(a: Coord, b: Coord): number {
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Linear interpolation between two coordinates; t is clamped to [0, 1]. */
export function lerpCoord(a: Coord, b: Coord, t: number): Coord {
  const k = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/**
 * Minutes until the bus reaches `target`, following the remaining route rather
 * than flying straight there. Returns at least 1 whenever there is any distance
 * left, so the UI never claims "0 mins" while the bus is still moving.
 */
export function etaMinutes(
  distanceMeters: number,
  speedKmh: number,
): number {
  const effectiveSpeed = speedKmh > 3 ? speedKmh : 22; // idle bus: assume 22 km/h
  const minutes = (distanceMeters / 1000 / effectiveSpeed) * 60;
  if (distanceMeters < 60) return 0;
  return Math.max(1, Math.round(minutes));
}

/**
 * Distance the bus still has to cover to reach `targetIndex`, measured along
 * the waypoint path in the direction of travel.
 */
export function routeDistanceMeters(
  busCoord: Coord,
  busStopIndex: number,
  targetIndex: number,
  waypoints: Coord[],
): number {
  if (busStopIndex === targetIndex) return haversineMeters(busCoord, waypoints[targetIndex]);

  const forward = targetIndex > busStopIndex;
  const step = forward ? 1 : -1;
  let total = haversineMeters(busCoord, waypoints[busStopIndex + step] ?? waypoints[busStopIndex]);

  for (let i = busStopIndex + step; i !== targetIndex; i += step) {
    const next = waypoints[i + step];
    if (!next) break;
    total += haversineMeters(waypoints[i], next);
  }
  return total;
}
