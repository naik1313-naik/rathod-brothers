/**
 * Contact section — split layout: company details on the left, quote form on
 * the right. Every phone, email and WhatsApp link is derived from `business.ts`.
 */
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { QuoteForm } from '@/components/QuoteForm';
import { Reveal } from '@/components/motion';
import { business, primaryPhone, secondaryPhone } from '@/lib/business';
import { mailtoHref, telHref, whatsappHref } from '@/lib/links';

export function Contact(): JSX.Element {
  const contactItems = [
    {
      icon: Phone,
      label: 'Phone 01',
      value: primaryPhone.display,
      href: telHref(primaryPhone),
      note: 'Primary line',
    },
    {
      icon: Phone,
      label: 'Phone 02',
      value: secondaryPhone.display,
      href: telHref(secondaryPhone),
      note: 'Alternate line',
    },
    {
      icon: Mail,
      label: 'Email',
      value: business.email,
      href: mailtoHref(business.email, 'Enquiry for Rathod Brothers'),
      note: 'We reply by email',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: business.location.label,
      // No invented address and no fake map pin — links to a region search.
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.location.label)}`,
      note: 'Service area',
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-to-b from-sand-100 to-sand-200 py-20 sm:py-24 lg:py-32"
    >
      <div className="grid-overlay" aria-hidden="true" />

      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
          {/* ---- left: contact information ---- */}
          <div>
            <Reveal direction="up" duration={0.6}>
              <span className="eyebrow">Get in touch</span>
              <h2 className="mt-5 text-display-lg text-navy-600">
                Let&rsquo;s move your
                <br />
                <span className="text-gold-contrast">next project.</span>
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.1} duration={0.7}>
              <p className="mt-6 max-w-prose text-[15px] leading-[1.75] text-ink-soft">
                For transport, excavation, site clearance or machinery enquiries, contact the team
                directly. The fastest route is a phone call — otherwise send an enquiry and we will
                get back to you.
              </p>
            </Reveal>

            {/* contact list */}
            <Reveal direction="up" delay={0.16} duration={0.7}>
              <ul className="mt-9 space-y-1">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-600 text-white transition-colors duration-300 group-hover:bg-gold group-hover:text-navy-800">
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                          {item.label}
                        </span>
                        <span className="mt-1 block break-words font-display text-[14.5px] font-extrabold text-navy-600">
                          {item.value}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-faint">{item.note}</span>
                      </span>
                    </>
                  );

                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="group flex items-center gap-4 border-b border-navy-600/10 py-3.5 transition-colors duration-300 hover:bg-white/60"
                      >
                        {content}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            {/* availability */}
            <Reveal direction="up" delay={0.2} duration={0.7}>
              <div className="mt-8 rounded-xl border border-navy-600/12 bg-white/60 p-5">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-gold-dark" strokeWidth={2.2} />
                  <h3 className="font-display text-[13px] font-extrabold uppercase tracking-[0.06em] text-navy-600">
                    {business.availability.label}
                  </h3>
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
                  {business.availability.note}. For the quickest response, call{' '}
                  <a
                    href={telHref(primaryPhone)}
                    className="font-extrabold text-navy-600 underline underline-offset-2"
                  >
                    {primaryPhone.display}
                  </a>{' '}
                  or message us on WhatsApp — both reach the team directly.
                </p>
              </div>
            </Reveal>

            {/* quick actions */}
            <Reveal direction="up" delay={0.26} duration={0.7}>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                <a
                  href={whatsappHref({}, primaryPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2.3} />
                  WhatsApp Us
                </a>
                <a href={telHref(primaryPhone)} className="btn-ghost">
                  <Phone className="h-4 w-4" strokeWidth={2.4} />
                  Call Now
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                {business.social.map((account) => (
                  <a
                    key={account.handle}
                    href={account.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[12px] font-bold text-ink-soft transition-colors duration-300 hover:text-navy-600"
                  >
                    <Instagram className="h-3.5 w-3.5" strokeWidth={2.2} />
                    {account.handle}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ---- right: quote form ---- */}
          <Reveal direction="left" delay={0.1} amount={0.1}>
            <QuoteForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
