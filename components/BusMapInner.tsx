'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { BusLocation } from '@/types';
import { DRIVER } from '@/lib/mockData';
import { useI18n } from '@/lib/i18n/context';

export interface MapPin {
  id: string;
  /** One or two characters drawn inside the pin. */
  glyph: string;
  coords: [number, number];
  title: string;
  subtitle?: string;
  color: string;
}

export interface BusMapProps {
  bus: BusLocation;
  pins: MapPin[];
  route: [number, number][];
  /** Keep the bus in view as it moves. */
  follow?: boolean;
  className?: string;
}

/**
 * Every marker is a divIcon built from our own markup: it keeps the map inside
 * the app's visual language and avoids Leaflet's default image-path breakage
 * under a bundler entirely.
 */
function busIcon(heading: number) {
  return L.divIcon({
    className: '',
    html: `
      <div class="bus-marker">
        <span class="bus-marker__ring"></span>
        <span class="bus-marker__body" style="transform: rotate(${heading}deg)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5 20 21l-8-4.2L4 21z"/>
          </svg>
        </span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function pinIcon(glyph: string, color: string) {
  return L.divIcon({
    className: '',
    html: `<span class="pin" style="background:${color}">${glyph}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/** Frames the whole route once, so the demo never opens on an arbitrary crop. */
function FitRoute({ route }: { route: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length < 2) return;
    map.fitBounds(L.latLngBounds(route), { padding: [36, 36] });
  }, [map, route]);
  return null;
}

function FollowBus({ bus, enabled }: { bus: BusLocation; enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    map.panTo([bus.lat, bus.lng], { animate: true, duration: 0.8 });
  }, [map, enabled, bus.lat, bus.lng]);
  return null;
}

export default function BusMapInner({
  bus,
  pins,
  route,
  follow = false,
  className = '',
}: BusMapProps) {
  const { t } = useI18n();
  const icon = useMemo(() => busIcon(bus.heading), [bus.heading]);

  return (
    <MapContainer
      center={[bus.lat, bus.lng]}
      zoom={14}
      scrollWheelZoom
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      <Polyline
        positions={route}
        pathOptions={{ color: '#ffc40c', weight: 3, opacity: 0.55, dashArray: '1 7', lineCap: 'round' }}
      />

      {pins.map((pin) => (
        <Marker key={pin.id} position={pin.coords} icon={pinIcon(pin.glyph, pin.color)}>
          <Tooltip direction="top" offset={[0, -14]}>
            <span className="font-semibold">{pin.title}</span>
            {pin.subtitle ? <span className="block opacity-70">{pin.subtitle}</span> : null}
          </Tooltip>
        </Marker>
      ))}

      <Marker position={[bus.lat, bus.lng]} icon={icon} zIndexOffset={1000}>
        <Tooltip direction="top" offset={[0, -20]}>
          <span className="font-semibold">{t('common.bus', { number: DRIVER.busNumber })}</span>
          <span className="block opacity-70">
            {t('map.speed', { speed: Math.round(bus.speed) })}
          </span>
        </Tooltip>
      </Marker>

      <FitRoute route={route} />
      <FollowBus bus={bus} enabled={follow} />
    </MapContainer>
  );
}
