import type { StudentStatus } from '@/types';
import { STATUS_META } from '@/lib/status';

export function StatusBadge({
  status,
  full = false,
  className = '',
}: {
  status: StudentStatus;
  full?: boolean;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 text-[12px] leading-5 font-medium ${meta.chip} ${className}`}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.hex }}
        aria-hidden
      />
      {full ? meta.label : meta.short}
    </span>
  );
}
