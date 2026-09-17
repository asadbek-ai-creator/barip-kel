'use client';

import { useState } from 'react';
import { initials } from '@/lib/status';

/**
 * Student photo with an initials fallback, so a missing or blocked image never
 * leaves a broken frame in the middle of a demo.
 */
export function Avatar({
  name,
  src,
  size = 44,
  dimmed = false,
}: {
  name: string;
  src?: string;
  size?: number;
  dimmed?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const px = `${size}px`;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-sm border border-line bg-ink-3 font-display font-semibold text-mute ${
        dimmed ? 'opacity-45 grayscale' : ''
      }`}
      style={{ width: px, height: px, fontSize: `${Math.round(size * 0.36)}px` }}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- local static SVG, no optimisation needed
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
    </span>
  );
}
