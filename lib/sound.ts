'use client';

/**
 * A short two-note chime for arrival / boarding alerts.
 *
 * Browsers refuse to start an AudioContext before the user has interacted with
 * the page, so the context is created lazily on the first gesture and every
 * call before that quietly does nothing — the visual toast always fires either
 * way, so a silent chime never costs the demo an alert.
 */

let ctx: AudioContext | null = null;
let unlocked = false;

type WindowWithLegacyAudio = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;

  const w = window as WindowWithLegacyAudio;
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;

  try {
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

/** Call once from a click/tap handler to satisfy autoplay policy. */
export function unlockAudio(): void {
  if (unlocked) return;
  const c = getContext();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  unlocked = true;
}

function tone(c: AudioContext, freq: number, start: number, duration: number) {
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;

  // Quick attack, gentle release — avoids the click of a hard gate.
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export type ChimeKind = 'info' | 'alert';

export function playChime(kind: ChimeKind = 'info'): void {
  const c = getContext();
  if (!c || c.state !== 'running') return;

  const t = c.currentTime;
  if (kind === 'alert') {
    tone(c, 740, t, 0.16);
    tone(c, 554, t + 0.18, 0.28);
  } else {
    tone(c, 659, t, 0.14);
    tone(c, 880, t + 0.15, 0.26);
  }
}
