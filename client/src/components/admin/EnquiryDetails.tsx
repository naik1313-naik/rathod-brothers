/**
 * Enquiry detail drawer.
 *
 * Opens over the list, shows every stored field, and provides the two actions
 * that matter operationally: change status, and delete. Delete requires an
 * explicit confirmation because it is irreversible.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, MessageCircle, Phone, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useFocusTrap } from '@/hooks';
import { formatDate, formatDateTime, telHref, whatsappHref } from '@/lib/links';
import { ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from '@/types/api';

interface EnquiryDetailsProps {
  enquiry: Enquiry | null;
  onClose: () => void;
  onStatusChange: (id: number, status: EnquiryStatus) => void;
  onDelete: (id: number) => void;
  busy: boolean;
}

export function EnquiryDetails({
  enquiry,
  onClose,
  onStatusChange,
  onDelete,
  busy,
}: EnquiryDetailsProps): JSX.Element {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = enquiry !== null;
  useFocusTrap(open);

  // Escape closes, and focus moves into the panel when it opens.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setConfirmDelete(false);
  }, [open]);

  const rows: Array<[string, string | null]> = [
    ['Customer', enquiry?.name ?? '—'],
    ['Phone', enquiry?.phone ?? '—'],
    ['Service', enquiry?.service ?? '—'],
    ['Pickup / Site', enquiry?.pickup ?? '—'],
    ['Destination', enquiry?.destination ?? '—'],
    ['Preferred date', enquiry?.preferred_date ? formatDate(enquiry.preferred_date) : '—'],
    ['Received', enquiry ? formatDateTime(enquiry.created_at) : '—'],
    ['Last updated', enquiry ? formatDateTime(enquiry.updated_at) : '—'],
  ];

  return (
    <AnimatePresence>
      {open && enquiry ? (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-navy-900/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-detail-title"
            className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col bg-white shadow-card-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* header */}
            <div className="flex items-start justify-between gap-4 border-b border-navy-600/10 bg-sand-50 px-6 py-5">
              <div className="min-w-0">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
                  Enquiry #{enquiry.id}
                </p>
                <h2
                  id="enquiry-detail-title"
                  className="mt-1.5 truncate font-display text-[19px] font-extrabold text-navy-600"
                >
                  {enquiry.name}
                </h2>
                <div className="mt-2.5">
                  <StatusBadge status={enquiry.status} />
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy-600/12 text-ink-mute transition-colors hover:bg-navy-600 hover:text-white"
                aria-label="Close enquiry details"
              >
                <X className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <dl className="divide-y divide-navy-600/8">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                      {label}
                    </dt>
                    <dd className="text-right text-[13px] font-semibold text-ink-soft">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">Message</p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-sand-100 p-3.5 text-[13px] leading-relaxed text-ink-soft">
                  {enquiry.message || 'No message was left with this enquiry.'}
                </p>
              </div>

              {/* status change */}
              <div className="mt-6 rounded-xl border border-navy-600/12 p-4">
                <label
                  htmlFor="detail-status"
                  className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                >
                  Update status
                </label>
                <div className="mt-2.5 flex items-center gap-2.5">
                  <select
                    id="detail-status"
                    value={enquiry.status}
                    disabled={busy}
                    onChange={(event) => onStatusChange(enquiry.id, event.target.value as EnquiryStatus)}
                    className="field flex-1 py-2.5"
                  >
                    {ENQUIRY_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin text-ink-faint" strokeWidth={2.6} /> : null}
                </div>
              </div>
            </div>

            {/* footer actions */}
            <div className="border-t border-navy-600/10 bg-sand-50 px-6 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={telHref({ digits: enquiry.phone.replace(/\D/g, '') })}
                  className="btn-primary btn-sm justify-center"
                >
                  <Phone className="h-4 w-4" strokeWidth={2.4} />
                  Call
                </a>
                <a
                  href={whatsappHref({
                    name: enquiry.name,
                    phone: enquiry.phone,
                    service: enquiry.service,
                    pickup: enquiry.pickup ?? undefined,
                    destination: enquiry.destination ?? undefined,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-sm justify-center"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
                  WhatsApp
                </a>
              </div>

              <div className="mt-2.5">
                {confirmDelete ? (
                  <div className="rounded-lg border border-red-500/35 bg-red-50 p-3">
                    <p className="flex items-start gap-2 text-[11.5px] font-semibold leading-relaxed text-red-900">
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                      Delete this enquiry permanently? This cannot be undone.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(enquiry.id);
                          setConfirmDelete(false);
                        }}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-[11.5px] font-extrabold text-white transition-colors hover:bg-red-700"
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-md border border-navy-600/15 px-3 py-1.5 text-[11.5px] font-extrabold text-navy-600 transition-colors hover:bg-sand-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full rounded-md py-2 text-[11.5px] font-bold text-ink-faint transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    Delete enquiry
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
