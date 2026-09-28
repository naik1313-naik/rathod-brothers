/**
 * Site footer: brand block, quick links, services, contact details and social.
 */
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { business, primaryPhone, secondaryPhone, services } from '@/lib/business';
import { mailtoHref, telHref } from '@/lib/links';

const QUICK_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'Services', id: 'services' },
  { label: 'Equipment', id: 'equipment' },
  { label: 'Coverage', id: 'coverage' },
  { label: 'Owners', id: 'owners' },
  { label: 'Contact', id: 'contact' },
];

export function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  const jump = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>): void => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const navHeight = Number.parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--rb-nav-height') || '76',
      10,
    );
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navHeight - 8,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <footer className="on-dark relative overflow-hidden bg-navy-900 pt-16 pb-10 sm:pt-20">
      <div className="grid-overlay-dark" aria-hidden="true" />

      <div className="shell relative">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-12 w-12" variant="dark" />
              <div>
                <p className="font-display text-[17px] font-extrabold uppercase tracking-[0.06em] text-white">
                  Rathod <span className="text-gold">Brothers</span>
                </p>
                <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-navy-300">
                  {business.tagline}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xs text-[13px] leading-[1.75] text-navy-300">
              Earthmoving, heavy machinery, excavator sale and service, tipper transport, JCB
              earthmoving and site clearance across Karnataka.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {business.social.map((account) => (
                <a
                  key={account.handle}
                  href={account.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 text-navy-200 transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-navy-800"
                  aria-label={`${business.name} on Instagram — ${account.handle}`}
                >
                  <Instagram className="h-4 w-4" strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer quick links">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Quick Links</h2>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={jump(link.id)}
                    className="text-[13px] font-medium text-navy-200 transition-colors duration-300 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Services</h2>
            <ul className="mt-5 space-y-2.5">
              {services.map((service) => (
                <li key={service.key}>
                  <a
                    href="#services"
                    onClick={jump('services')}
                    className="block text-[13px] leading-snug text-navy-200 transition-colors duration-300 hover:text-gold"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#services"
                  onClick={jump('services')}
                  className="text-[13px] font-medium text-navy-200 transition-colors duration-300 hover:text-gold"
                >
                  Site Clearance
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Contact</h2>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href={telHref(primaryPhone)}
                  className="group flex items-start gap-3 transition-colors duration-300"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-navy-300 transition-colors group-hover:text-gold" strokeWidth={2.2} />
                  <span>
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-navy-400">
                      Phone 01
                    </span>
                    <span className="mt-0.5 block text-[13.5px] font-bold text-white transition-colors group-hover:text-gold">
                      {primaryPhone.display}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={telHref(secondaryPhone)}
                  className="group flex items-start gap-3 transition-colors duration-300"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-navy-300 transition-colors group-hover:text-gold" strokeWidth={2.2} />
                  <span>
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-navy-400">
                      Phone 02
                    </span>
                    <span className="mt-0.5 block text-[13.5px] font-bold text-white transition-colors group-hover:text-gold">
                      {secondaryPhone.display}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={mailtoHref(business.email)}
                  className="group flex items-start gap-3 transition-colors duration-300"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-navy-300 transition-colors group-hover:text-gold" strokeWidth={2.2} />
                  <span>
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-navy-400">
                      Email
                    </span>
                    <span className="mt-0.5 block break-all text-[13.5px] font-bold text-white transition-colors group-hover:text-gold">
                      {business.email}
                    </span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" strokeWidth={2.2} />
                <span>
                  <span className="block font-mono text-[8.5px] uppercase tracking-[0.16em] text-navy-400">
                    Location
                  </span>
                  <span className="mt-0.5 block text-[13.5px] font-bold text-white">
                    {business.location.label}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 sm:flex-row">
          <p className="text-[11.5px] text-navy-400">
            &copy; {year} {business.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {business.social.map((account) => (
              <a
                key={account.handle}
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11.5px] text-navy-300 transition-colors duration-300 hover:text-gold"
              >
                {account.handle}
              </a>
            ))}
            <a
              href={business.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11.5px] font-bold text-gold transition-opacity duration-300 hover:opacity-80"
            >
              {business.website}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
