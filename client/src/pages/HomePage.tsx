/**
 * Public marketing page — assembles every section in narrative order.
 */
import { useEffect } from 'react';
import { Hero } from '@/sections/Hero';
import { Marquee } from '@/components/Marquee';
import { About } from '@/sections/About';
import { Services } from '@/sections/Services';
import { EquipmentGallery } from '@/sections/EquipmentGallery';
import { Coverage } from '@/sections/Coverage';
import { Owners } from '@/sections/Owners';
import { Contact } from '@/sections/Contact';
import { applyPageMeta, injectJsonLd, localBusinessJsonLd } from '@/lib/seo';
import { business } from '@/lib/business';

const MARQUEE_ITEMS = [
  'Excavators',
  'Tipper Transport',
  'JCB Earthmoving',
  'Site Clearance',
  'Excavator Sale & Service',
  'Material Movement',
];

export function HomePage(): JSX.Element {
  useEffect(() => {
    applyPageMeta({
      title: 'Rathod Brothers | Earthmovers & Heavy Machinery Services',
      description:
        'Rathod Brothers — Earthmovers & Heavy Machinery Services in Karnataka. Hitachi & Tata excavator sale and service, tipper transport, JCB earthmoving and site clearance. Call +91 90193 33304.',
      path: '/',
    });
    injectJsonLd(localBusinessJsonLd());
  }, []);

  return (
    <>
      <Hero />
      <Marquee items={MARQUEE_ITEMS} />
      <About />
      <Services />
      <EquipmentGallery />
      <Coverage />
      <Owners />
      <Contact />

      {/* Screen-reader-only business summary: gives crawlers the core facts in
          plain text without adding visual clutter. */}
      <section className="sr-only" aria-label="Business summary">
        <h2>{business.name} — {business.tagline}</h2>
        <p>
          {business.name} is an earthmoving and heavy machinery services business operating in{' '}
          {business.location.label}. Services include Hitachi and Tata excavator sale and service,
          local and statewide tipper transport, and JCB earthmoving for site clearance and
          construction activities.
        </p>
        <p>
          Contact: {business.phones[0].display} or {business.phones[1].display}. Email{' '}
          {business.email}.
        </p>
      </section>
    </>
  );
}
