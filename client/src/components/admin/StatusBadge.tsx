/**
 * Status pill used in the dashboard list and detail views.
 */
import type { EnquiryStatus } from '@/types/api';

interface StatusMeta {
  label: string;
  /** Tailwind classes per status. */
  className: string;
  dot: string;
}

export const STATUS_META: Record<EnquiryStatus, StatusMeta> = {
  NEW: {
    label: 'New',
    className: 'border-blue-500/30 bg-blue-50 text-blue-800',
    dot: 'bg-blue-500',
  },
  CONTACTED: {
    label: 'Contacted',
    className: 'border-amber-500/35 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'border-violet-500/30 bg-violet-50 text-violet-800',
    dot: 'bg-violet-500',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'border-emerald-500/30 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'border-navy-600/20 bg-navy-50 text-navy-600',
    dot: 'bg-navy-500',
  },
};

export function StatusBadge({ status }: { status: EnquiryStatus }): JSX.Element {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.06em] ${meta.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
