/**
 * Enquiry table with inline status changes.
 *
 * Status is patched immediately on select — the row shows a brief "saving"
 * state and reverts the select if the request fails, so the UI can never
 * silently disagree with the database.
 */
import { useState } from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDateTime, telHref, whatsappHref } from '@/lib/links';
import { ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from '@/types/api';

interface EnquiryTableProps {
  enquiries: Enquiry[];
  updatingId: number | null;
  onStatusChange: (id: number, status: EnquiryStatus) => void;
  onView: (enquiry: Enquiry) => void;
}

type SortKey = 'newest' | 'oldest' | 'name' | 'status';

export function EnquiryTable({
  enquiries,
  updatingId,
  onStatusChange,
  onView,
}: EnquiryTableProps): JSX.Element {
  const [sort, setSort] = useState<SortKey>('newest');

  const sorted = [...enquiries].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return a.created_at.localeCompare(b.created_at);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'newest':
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });

  if (enquiries.length === 0) {
    return (
      <div className="rounded-xl border border-navy-600/12 bg-white px-6 py-16 text-center">
        <p className="font-display text-[15px] font-extrabold text-navy-600">No enquiries found</p>
        <p className="mt-2 text-[12.5px] text-ink-mute">
          Nothing matches the current filters. Try clearing the search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* sort control */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <ArrowUpDown className="h-3.5 w-3.5 text-ink-faint" strokeWidth={2.2} />
        <label htmlFor="admin-sort" className="sr-only">
          Sort enquiries
        </label>
        <select
          id="admin-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="rounded-lg border border-navy-600/15 bg-white px-2.5 py-1.5 text-[12px] font-bold text-navy-600"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-navy-600/12 bg-white lg:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Enquiries, newest first</caption>
          <thead>
            <tr className="border-b border-navy-600/10 bg-sand-50">
              <Th>Customer</Th>
              <Th>Service</Th>
              <Th>Route</Th>
              <Th>Received</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((enquiry) => (
              <tr key={enquiry.id} className="border-b border-navy-600/8 last:border-0 hover:bg-sand-50/60">
                <Td>
                  <span className="block font-display text-[13.5px] font-extrabold text-navy-600">
                    {enquiry.name}
                  </span>
                  <a
                    href={telHref({ digits: enquiry.phone.replace(/\D/g, '') })}
                    className="mt-0.5 block font-mono text-[11.5px] text-ink-mute hover:text-navy-600"
                  >
                    {enquiry.phone}
                  </a>
                </Td>
                <Td>
                  <span className="text-[12.5px] font-semibold text-ink-soft">{enquiry.service}</span>
                </Td>
                <Td>
                  <span className="block max-w-[15rem] truncate text-[12.5px] text-ink-soft">
                    {enquiry.pickup && enquiry.destination
                      ? `${enquiry.pickup} → ${enquiry.destination}`
                      : (enquiry.pickup ?? enquiry.destination) || '—'}
                  </span>
                  {enquiry.preferred_date ? (
                    <span className="mt-0.5 block font-mono text-[10.5px] text-ink-faint">
                      Prefers {formatDate(enquiry.preferred_date)}
                    </span>
                  ) : null}
                </Td>
                <Td>
                  <span className="whitespace-nowrap font-mono text-[11.5px] text-ink-mute">
                    {formatDateTime(enquiry.created_at)}
                  </span>
                </Td>
                <Td>
                  <StatusSelect
                    enquiry={enquiry}
                    busy={updatingId === enquiry.id}
                    onChange={(status) => onStatusChange(enquiry.id, status)}
                  />
                </Td>
                <Td className="text-right">
                  <button type="button" onClick={() => onView(enquiry)} className="btn-ghost btn-sm">
                    View
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {sorted.map((enquiry) => (
          <li key={enquiry.id} className="rounded-xl border border-navy-600/12 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[14px] font-extrabold text-navy-600">{enquiry.name}</p>
                <a
                  href={telHref({ digits: enquiry.phone.replace(/\D/g, '') })}
                  className="mt-0.5 block font-mono text-[11.5px] text-ink-mute"
                >
                  {enquiry.phone}
                </a>
              </div>
              <StatusBadge status={enquiry.status} />
            </div>

            <p className="mt-3 text-[12.5px] font-semibold text-ink-soft">{enquiry.service}</p>
            {enquiry.pickup || enquiry.destination ? (
              <p className="mt-1 text-[12px] text-ink-mute">
                {enquiry.pickup && enquiry.destination
                  ? `${enquiry.pickup} → ${enquiry.destination}`
                  : `${enquiry.pickup ?? ''}${enquiry.destination ?? ''}`.trim()}
              </p>
            ) : null}
            <p className="mt-2 font-mono text-[10.5px] text-ink-faint">
              {formatDateTime(enquiry.created_at)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-600/8 pt-3">
              <StatusSelect
                enquiry={enquiry}
                busy={updatingId === enquiry.id}
                onChange={(status) => onStatusChange(enquiry.id, status)}
              />
              <button type="button" onClick={() => onView(enquiry)} className="btn-ghost btn-sm ml-auto">
                View
              </button>
              <a
                href={whatsappHref({ name: enquiry.name, phone: enquiry.phone, service: enquiry.service })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost btn-sm"
              >
                WhatsApp
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function StatusSelect({
  enquiry,
  busy,
  onChange,
}: {
  enquiry: Enquiry;
  busy: boolean;
  onChange: (status: EnquiryStatus) => void;
}): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5">
      <label htmlFor={`status-${enquiry.id}`} className="sr-only">
        Status for {enquiry.name}
      </label>
      <select
        id={`status-${enquiry.id}`}
        value={enquiry.status}
        disabled={busy}
        onChange={(event) => onChange(event.target.value as EnquiryStatus)}
        className="rounded-lg border border-navy-600/15 bg-white px-2.5 py-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.05em] text-navy-600 disabled:opacity-60"
      >
        {ENQUIRY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replace('_', ' ')}
          </option>
        ))}
      </select>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" strokeWidth={2.6} /> : null}
    </span>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }): JSX.Element {
  return <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;
}
