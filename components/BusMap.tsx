'use client';

import dynamic from 'next/dynamic';
import type { BusMapProps } from './BusMapInner';
import { useI18n } from '@/lib/i18n/context';

function MapLoading() {
  const { t } = useI18n();
  return (
    <div className="grid h-full w-full place-items-center bg-[#0a1220]">
      <span className="text-[13px] text-faint">{t('map.loading')}</span>
    </div>
  );
}

/**
 * Leaflet touches `window` on import, so the real map is loaded only in the
 * browser. `ssr: false` is legal here because this module is a Client Component.
 */
const BusMapInner = dynamic(() => import('./BusMapInner'), {
  ssr: false,
  loading: () => <MapLoading />,
});

export type { MapPin } from './BusMapInner';

export function BusMap(props: BusMapProps) {
  return <BusMapInner {...props} />;
}
