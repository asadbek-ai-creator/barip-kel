'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { AbsenceReason } from '@/types';
import { ABSENCE_REASONS } from '@/lib/status';

const REASONS: AbsenceReason[] = ['sick', 'parents_driving', 'vacation'];

export function SkipTripModal({
  open,
  studentName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  studentName: string;
  onClose: () => void;
  onConfirm: (reason: AbsenceReason) => void;
}) {
  const [reason, setReason] = useState<AbsenceReason>('sick');
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setReason('sick');
    panel.current?.querySelector<HTMLElement>('input')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-[2px]"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-title"
        className="toast-in relative w-full max-w-md rounded-t-md border border-line bg-ink-2 p-4 sm:rounded-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="skip-title" className="font-display text-[20px] leading-7 font-semibold">
              Skip the bus today
            </h2>
            <p className="text-[13px] leading-5 text-mute">
              Búgin barmaydı — the driver sees this straight away.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-1 rounded p-1 text-faint transition-colors hover:text-chalk"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <fieldset className="mt-4">
          <legend className="text-[13px] text-mute">
            Why is {studentName.split(' ')[0]} not riding?
          </legend>
          <div className="mt-2 space-y-2">
            {REASONS.map((r) => (
              <label
                key={r}
                className={`flex h-12 cursor-pointer items-center gap-3 rounded-sm border px-3 text-[15px] transition-colors ${
                  reason === r
                    ? 'border-hiviz/60 bg-hiviz/10 text-chalk'
                    : 'border-line text-mute hover:text-chalk'
                }`}
              >
                <input
                  type="radio"
                  name="absence-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="size-4 accent-[var(--color-hiviz)]"
                />
                {ABSENCE_REASONS[r]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-sm border border-line text-[15px] font-semibold text-mute transition-colors hover:text-chalk"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className="h-12 flex-1 rounded-sm bg-hiviz text-[15px] font-semibold text-ink transition-colors hover:bg-hiviz/90"
          >
            Tell the driver
          </button>
        </div>
      </div>
    </div>
  );
}
