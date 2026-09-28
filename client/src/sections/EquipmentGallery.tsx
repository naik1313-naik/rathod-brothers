/**
 * Equipment & Services gallery.
 *
 * IMPORTANT — these are NOT photographs of the Rathod Brothers fleet. No real
 * machine photos have been supplied, so the section uses on-brand technical
 * illustrations and says so plainly on screen. Each tile is driven by a single
 * config object, so replacing an image with a real photograph later is a
 * one-line change in `lib/business.ts` — see the README.
 */
import { useState } from 'react';
import { Camera, ImageOff } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/motion';
import { images } from '@/lib/business';

interface GalleryItem {
  key: string;
  label: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
  span: string;
}

const ITEMS: GalleryItem[] = [
  {
    key: 'excavator',
    label: 'Excavators',
    title: 'Hitachi & Tata Excavators',
    caption: 'Sale and service support for construction, infrastructure and earthmoving requirements.',
    src: images.equipment.excavator.src,
    alt: images.equipment.excavator.alt,
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    key: 'tipper',
    label: 'Tippers',
    title: 'Tipper Transport',
    caption: 'Material movement and project logistics, locally and across Karnataka.',
    src: images.equipment.tipper.src,
    alt: images.equipment.tipper.alt,
    span: 'lg:col-span-2',
  },
  {
    key: 'jcb',
    label: 'JCB Earthmovers',
    title: 'JCB Earthmoving',
    caption: 'Site preparation, clearance and construction activity support.',
    src: images.equipment.jcb.src,
    alt: images.equipment.jcb.alt,
    span: 'lg:col-span-2',
  },
];

export function EquipmentGallery(): JSX.Element {
  return (
    <section id="equipment" className="relative overflow-hidden bg-sand-200 py-20 sm:py-24 lg:py-32">
      <div className="grid-overlay" aria-hidden="true" />

      <div className="shell relative">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <SectionHeading
            eyebrow="Equipment & services"
            title="Machinery categories"
            accent="we support."
          />

          <Reveal direction="up" delay={0.12} amount={0.2}>
            <div className="lg:pb-3">
              <p className="max-w-prose text-[15px] leading-[1.75] text-ink-soft">
                The visuals below are <strong className="font-bold text-navy-700">illustrated
                placeholders</strong>, not photographs of our own machines. They show the equipment
                and service categories we support while real fleet photography is being prepared.
              </p>
              <p className="mt-4 inline-flex items-start gap-2.5 rounded-lg border border-gold/45 bg-gold/12 px-4 py-3 text-[12.5px] leading-relaxed text-navy-700">
                <Camera className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" strokeWidth={2.2} />
                <span>
                  Real machinery photographs can be dropped in at any time — each tile is driven by a
                  single entry in the site configuration.
                </span>
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {ITEMS.map((item, index) => (
            <Reveal
              key={item.key}
              direction="up"
              delay={0.08 * index}
              duration={0.7}
              amount={0.15}
              className={item.span}
            >
              <GalleryTile item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryTile({ item }: { item: GalleryItem }): JSX.Element {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="group relative h-full min-h-[260px] overflow-hidden rounded-xl border border-navy-600/12 bg-navy-700 shadow-card transition-all duration-500 ease-industrial hover:border-navy-500 hover:shadow-card-lg lg:min-h-[300px]">
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-700 p-6 text-center">
          <ImageOff className="h-7 w-7 text-navy-300" strokeWidth={1.8} />
          <span className="text-[12px] font-bold text-navy-200">{item.title}</span>
          <span className="text-[10.5px] text-navy-300">Image unavailable</span>
        </div>
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-industrial group-hover:scale-[1.09]"
          onError={() => setFailed(true)}
        />
      )}

      {/* scrim */}
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/35 to-transparent transition-opacity duration-500 group-hover:from-navy-900 group-hover:via-navy-900/50"
        aria-hidden="true"
      />

      {/* caption */}
      <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-gold">
          {item.label}
        </span>
        <h3 className="mt-2 font-display text-[18px] font-extrabold leading-tight text-white sm:text-[21px]">
          {item.title}
        </h3>
        <p className="mt-2 max-h-0 overflow-hidden text-[12.5px] leading-relaxed text-navy-100/90 opacity-0 transition-all duration-500 ease-industrial group-hover:max-h-24 group-hover:opacity-100">
          {item.caption}
        </p>
      </figcaption>

      {/* corner ticks — engineering detail */}
      <span
        className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-gold/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-gold/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
    </figure>
  );
}
