'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Bus, CheckCircle2, School, TriangleAlert, X } from 'lucide-react';
import { playChime, unlockAudio, type ChimeKind } from '@/lib/sound';

export type ToastTone = 'board' | 'school' | 'alert' | 'info';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: ToastTone;
}

type ToastInput = Omit<Toast, 'id'>;

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

/** Raise a toast from anywhere below the root layout. */
export function useToast() {
  return useContext(ToastContext);
}

const TONE: Record<
  ToastTone,
  { icon: typeof Bus; accent: string; chime: ChimeKind }
> = {
  board: { icon: CheckCircle2, accent: 'text-board', chime: 'info' },
  school: { icon: School, accent: 'text-school', chime: 'info' },
  alert: { icon: TriangleAlert, accent: 'text-alert', chime: 'alert' },
  info: { icon: Bus, accent: 'text-hiviz', chime: 'info' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { ...input, id }]);
    playChime(TONE[input.tone].chime);
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  // Autoplay policy: the audio context can only start from a real gesture.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-0 z-[2000] flex flex-col items-center gap-2 p-3"
      >
        {toasts.map((t) => {
          const { icon: Icon, accent } = TONE[t.tone];
          return (
            <div
              key={t.id}
              className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border border-line bg-ink-2/95 p-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.9)] backdrop-blur"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${accent}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-semibold">{t.title}</p>
                {t.body ? (
                  <p className="mt-0.5 text-[13px] leading-snug text-mute">
                    {t.body}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-m-1 rounded p-1 text-faint transition-colors hover:text-chalk"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
