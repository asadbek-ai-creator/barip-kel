'use client';

import dynamic from 'next/dynamic';
import type { BusMapProps } from './BusMapInner';

/**
 * Leaflet touches `window` on import, so the real map is loaded only in the
 * browser. `ssr: false` is legal here because this module is a Client Component.
 */
const BusMapInner = dynamic(() => import('./BusMapInner'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-[#0a1220]">
      <span className="text-[13px] text-faint">Loading map…</span>
    </div>
  ),
});

export type { MapPin } from './BusMapInner';

export function BusMap(props: BusMapProps) {
  return <BusMapInner {...props} />;
}
