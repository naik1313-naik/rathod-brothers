/**
 * Dashboard: enquiry counts by status, the most recent submissions, and quick
 * actions. Every number comes from `GET /api/enquiries/stats` — nothing is
 * computed or hard-coded in the client.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Inbox, Loader2, MessageCircle, PhoneCall, RefreshCw } from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useAuth } from '@/services/AuthContext';
import { fetchEnquiries, fetchStats } from '@/services/adminService';
import { formatDate, formatDateTime, telHref, whatsappHref } from '@/lib/links';
import { applyPageMeta } from '@/lib/seo';
import { ApiError, type Enquiry, type EnquiryStats } from '@/types/api';

export function AdminDashboardPage(): JSX.Element {
  const { admin } = useAuth();
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [recent, setRecent] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applyPageMeta({
      title: 'Dashboard | Rathod Brothers Admin',
      description: 'Enquiry overview.',
      path: '/admin/dashboard',
      index: false,
    });
  }, []);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const [statsResult, listResult] = await Promise.all([
        fetchStats(),
        fetchEnquiries({ page: 1, pageSize: 6, sort: 'newest' }),
      ]);
      setStats(statsResult);
      setRecent(listResult.items);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.isNetworkError
          ? 'Cannot reach the API. Is the server running on port 4000?'
          : 'Could not load the dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards: Array<{ label: string; value: number | undefined; accent: string }> = [
    { label: 'Total', value: stats?.total, accent: 'bg-navy-600' },
    { label: 'New', value: stats?.new, accent: 'bg-blue-500' },
    { label: 'Contacted', value: stats?.contacted, accent: 'bg-amber-500' },
    { label: 'In Progress', value: stats?.inProgress, accent: 'bg-violet-500' },
    { label: 'Completed', value: stats?.completed, accent: 'bg-emerald-500' },
    { label: 'Cancelled', value: stats?.cancelled, accent: 'bg-navy-500' },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-extrabold text-navy-600 sm:text-[30px]">
            Dashboard
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-mute">
            Signed in as <span className="font-bold text-navy-600">{admin?.email}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="btn-ghost btn-sm"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.6} />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} />
          )}
          Refresh
        </button>
      </header>

      {error ? (
        <p
          role="alert"
          className="mt-6 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2.4} />
          {error}
        </p>
      ) : null}

      {/* stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-xl border border-navy-600/12 bg-white shadow-card"
          >
            <div className={`h-1 w-full ${card.accent}`} aria-hidden="true" />
            <div className="px-4 py-4">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                {card.label}
              </p>
              <p className="mt-2 font-display text-[26px] font-extrabold leading-none text-navy-600">
                {loading && card.value === undefined ? '—' : (card.value ?? 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* recent enquiries */}
      <section className="mt-8" aria-labelledby="recent-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="font-display text-[17px] font-extrabold text-navy-600">
            Recent enquiries
          </h2>
          <Link to="/admin/enquiries" className="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-navy-600 hover:gap-2.5">
            View all
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
          </Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-navy-600/12 bg-white">
          {loading && recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-[12.5px] text-ink-mute">Loading enquiries…</p>
          ) : recent.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Inbox className="mx-auto h-7 w-7 text-ink-faint" strokeWidth={1.8} />
              <p className="mt-3 font-display text-[14px] font-extrabold text-navy-600">
                No enquiries yet
              </p>
              <p className="mt-1.5 text-[12px] text-ink-mute">
                Submissions from the website will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-navy-600/8">
              {recent.map((enquiry) => (
                <li key={enquiry.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[13.5px] font-extrabold text-navy-600">
                      {enquiry.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-mute">
                      {enquiry.service}
                      {enquiry.pickup && enquiry.destination
                        ? ` · ${enquiry.pickup} → ${enquiry.destination}`
                        : ''}
                    </p>
                  </div>

                  <span className="font-mono text-[10.5px] text-ink-faint">
                    {formatDateTime(enquiry.created_at)}
                  </span>

                  <StatusBadge status={enquiry.status} />

                  <div className="flex items-center gap-1.5">
                    <a
                      href={telHref({ digits: enquiry.phone.replace(/\D/g, '') })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-navy-600/12 text-navy-600 transition-colors hover:bg-navy-600 hover:text-white"
                      aria-label={`Call ${enquiry.name}`}
                    >
                      <PhoneCall className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </a>
                    <a
                      href={whatsappHref({ name: enquiry.name, phone: enquiry.phone, service: enquiry.service })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#1FA855]/30 text-[#1FA855] transition-colors hover:bg-[#1FA855] hover:text-white"
                      aria-label={`WhatsApp ${enquiry.name}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mt-6 text-[11px] text-ink-faint">
        Preferred dates are shown in the visitor&rsquo;s local format.{' '}
        {recent[0]?.preferred_date ? `Latest preferred date on file: ${formatDate(recent[0].preferred_date)}.` : ''}
      </p>
    </div>
  );
}
