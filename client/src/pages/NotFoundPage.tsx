/**
 * 404. Rendered for any unmatched route; keeps the site chrome so the visitor
 * can get back to the content instead of hitting a dead end.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { primaryPhone } from '@/lib/business';
import { telHref } from '@/lib/links';
import { applyPageMeta } from '@/lib/seo';

export function NotFoundPage(): JSX.Element {
  useEffect(() => {
    applyPageMeta({
      title: 'Page Not Found | Rathod Brothers',
      description: 'The page you were looking for could not be found.',
      path: '/404',
      index: false,
    });
  }, []);

  return (
    <div className="on-dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy-900 px-5 py-16 text-center">
      <div className="grid-overlay-dark" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(241,189,24,0.12),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative">
        <Logo className="mx-auto h-14 w-14" variant="dark" />

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
          Error 404
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,9vw,5rem)] font-extrabold leading-[0.95] text-white">
          This ground
          <br />
          is unexcavated.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[14px] leading-relaxed text-navy-200">
          The page you were looking for has moved or never existed. Head back to the homepage, or
          call us and we will point you in the right direction.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
            Back to Home
          </Link>
          <a href={telHref(primaryPhone)} className="btn-ghost-on-dark">
            <Phone className="h-4 w-4" strokeWidth={2.4} />
            {primaryPhone.display}
          </a>
        </div>
      </div>
    </div>
  );
}
