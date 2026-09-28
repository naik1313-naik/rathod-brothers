/**
 * Enquiry management: search, status filter, pagination, inline status changes,
 * detail drawer and delete.
 *
 * Requests are abortable and every response is guarded against a stale render
 * (a slow earlier request can never overwrite a newer one), which matters here
 * because typing in the search box fires a request per keystroke.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { EnquiryTable } from '@/components/admin/EnquiryTable';
import { EnquiryDetails } from '@/components/admin/EnquiryDetails';
import { deleteEnquiry, fetchEnquiries, updateEnquiryStatus } from '@/services/adminService';
import { applyPageMeta } from '@/lib/seo';
import { ApiError, ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from '@/types/api';

const PAGE_SIZE = 10;

export function AdminEnquiriesPage(): JSX.Element {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<EnquiryStatus | 'ALL'>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [flash, setFlash] = useState('');

  // Only the newest request may write to state.
  const requestId = useRef(0);

  useEffect(() => {
    applyPageMeta({
      title: 'Enquiries | Rathod Brothers Admin',
      description: 'Manage website enquiries.',
      path: '/admin/enquiries',
      index: false,
    });
  }, []);

  // Debounce the search box so we do not hit the API on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async (): Promise<void> => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');

    try {
      const result = await fetchEnquiries({
        page,
        pageSize: PAGE_SIZE,
        status,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      if (id !== requestId.current) return;
      setEnquiries(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (caught) {
      if (id !== requestId.current) return;
      setError(
        caught instanceof ApiError && caught.isNetworkError
          ? 'Cannot reach the API. Is the server running on port 4000?'
          : 'Could not load enquiries.',
      );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = useCallback(
    async (id: number, next: EnquiryStatus): Promise<void> => {
      const previous = enquiries.find((item) => item.id === id);
      if (!previous || previous.status === next) return;

      // Optimistic update, reverted if the PATCH fails.
      setEnquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status: next } : item)),
      );
      setSelected((current) => (current && current.id === id ? { ...current, status: next } : current));
      setUpdatingId(id);

      try {
        const saved = await updateEnquiryStatus(id, next);
        setEnquiries((current) => current.map((item) => (item.id === id ? saved : item)));
        setSelected((current) => (current && current.id === id ? saved : current));
        setFlash(`Enquiry #${id} marked ${next.replace('_', ' ').toLowerCase()}.`);
        window.setTimeout(() => setFlash(''), 2600);
      } catch (caught) {
        setEnquiries((current) =>
          current.map((item) => (item.id === id ? { ...item, status: previous.status } : item)),
        );
        setSelected((current) =>
          current && current.id === id ? { ...current, status: previous.status } : current,
        );
        setError(
          caught instanceof ApiError && caught.status === 401
            ? 'Your session expired — sign in again.'
            : `Could not update enquiry #${id}. The change was reverted.`,
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [enquiries],
  );

  const remove = useCallback(
    async (id: number): Promise<void> => {
      setUpdatingId(id);
      try {
        await deleteEnquiry(id);
        setEnquiries((current) => current.filter((item) => item.id !== id));
        setTotal((current) => Math.max(0, current - 1));
        setSelected(null);
        setFlash(`Enquiry #${id} deleted.`);
        window.setTimeout(() => setFlash(''), 2600);
        // Step back a page if the last row on the final page was removed.
        setPage((current) => {
          const remaining = Math.max(0, total - 1);
          const lastPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
          return Math.min(current, lastPage);
        });
      } catch (caught) {
        setError(
          caught instanceof ApiError && caught.isNetworkError
            ? 'Cannot reach the API, so nothing was deleted.'
            : `Could not delete enquiry #${id}.`,
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [total],
  );

  const hasFilters = debouncedSearch !== '' || status !== 'ALL';

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-navy-600 sm:text-[30px]">
            Enquiries
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-mute">
            {loading ? 'Loading…' : `${total} ${total === 1 ? 'enquiry' : 'enquiries'} on file`}
          </p>
        </div>

        <button type="button" onClick={() => void load()} disabled={loading} className="btn-ghost btn-sm">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.6} />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
          )}
          Refresh
        </button>
      </header>

      {/* filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <label htmlFor="admin-search" className="sr-only">
            Search enquiries
          </label>
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, service, location…"
            className="field pl-10 pr-9"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-sand-200 hover:text-navy-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ) : null}
        </div>

        <label htmlFor="admin-status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="admin-status-filter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as EnquiryStatus | 'ALL');
            setPage(1);
          }}
          className="field w-auto min-w-[10rem] py-3"
        >
          <option value="ALL">All statuses</option>
          {ENQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value.replace('_', ' ')}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setDebouncedSearch('');
              setStatus('ALL');
              setPage(1);
            }}
            className="btn-ghost btn-sm"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* messages */}
      <div className="mt-4 space-y-2" aria-live="polite">
        {error ? (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-50 px-4 py-2.5 text-[12.5px] font-semibold text-red-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2.4} />
            {error}
          </p>
        ) : null}
        {flash ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 text-[12.5px] font-semibold text-emerald-800">
            {flash}
          </p>
        ) : null}
      </div>

      {/* table */}
      <div className="mt-4">
        {loading && enquiries.length === 0 ? (
          <div className="rounded-xl border border-navy-600/12 bg-white px-6 py-16 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-faint" strokeWidth={2.4} />
            <p className="mt-3 text-[12.5px] text-ink-mute">Loading enquiries…</p>
          </div>
        ) : (
          <EnquiryTable
            enquiries={enquiries}
            updatingId={updatingId}
            onStatusChange={(id, next) => void changeStatus(id, next)}
            onView={setSelected}
          />
        )}
      </div>

      {/* pagination */}
      {totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Enquiry pages">
          <p className="text-[11.5px] text-ink-mute">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="btn-ghost btn-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.6} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="btn-ghost btn-sm"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          </div>
        </nav>
      ) : null}

      {/* detail drawer */}
      <EnquiryDetails
        enquiry={selected}
        onClose={() => setSelected(null)}
        onStatusChange={(id, next) => void changeStatus(id, next)}
        onDelete={(id) => void remove(id)}
        busy={updatingId === selected?.id}
      />
    </div>
  );
}
