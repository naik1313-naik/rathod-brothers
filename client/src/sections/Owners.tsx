/**
 * Owners / Leadership section.
 *
 * Uses the real supplied photographs. Cards reveal on scroll, zoom on hover and
 * lift with a gold accent. No invented biographies are shown — only the name and
 * role, which is what has actually been provided.
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/motion';
import { owners } from '@/lib/business';
import { usePrefersReducedMotion } from '@/hooks';

/** Pairs each owner with their Instagram, by index. */
const OWNER_INSTAGRAM = [
  { platform: 'Instagram', handle: '@kumar_rathod_17', url: 'https://www.instagram.com/kumar_rathod_17/' },
  { platform: 'Instagram', handle: '@karan___rathod__25', url: 'https://www.instagram.com/karan___rathod__25/' },
];

export function Owners(): JSX.Element {
  return (
    <section id="owners" className="on-dark relative overflow-hidden bg-navy-800 py-20 sm:py-24 lg:py-32">
      <div className="grid-overlay-dark" aria-hidden="true" />

      {/* oversized ring, top right */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full border border-white/6"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[22rem] w-[22rem] rounded-full border border-gold/10"
        aria-hidden="true"
      />

      <div className="shell relative">
        <SectionHeading
          eyebrow="The people behind the work"
          title="The people behind"
          accent="Rathod Brothers."
          description="Rathod Brothers is run by its partners. When you call, you are speaking to the people who arrange the machines, the transport and the site work."
          onDark
          align="center"
          className="mb-14 lg:mb-16"
        />

        <div className="mx-auto grid max-w-4xl gap-7 sm:grid-cols-2 sm:gap-8">
          {owners.map((owner, index) => (
            <OwnerCard key={owner.name} owner={owner} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OwnerCard({
  owner,
  index,
}: {
  owner: (typeof owners)[number];
  index: number;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const instagram = OWNER_INSTAGRAM[index];

  return (
    <Reveal direction="up" delay={0.12 * index} duration={0.75} amount={0.2}>
      <motion.article
        className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-sm"
        whileHover={reduced ? undefined : { y: -8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {/* gold hairline that draws across on hover */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold-sheen transition-transform duration-500 ease-industrial group-hover:scale-x-100"
          aria-hidden="true"
        />

        <div className="relative aspect-[4/4.7] overflow-hidden bg-navy-900">
          {!failed ? (
            <>
              <img
                src={owner.image.src}
                alt={owner.image.alt}
                width={629}
                height={1400}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[center_18%] transition-transform duration-[900ms] ease-industrial group-hover:scale-[1.07]"
                onError={() => setFailed(true)}
              />
              {/* legibility scrim */}
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/25 to-transparent"
                aria-hidden="true"
              />
              {/* subtle grain to keep large photos from looking flat */}
              <span
                className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
                }}
                aria-hidden="true"
              />
            </>
          ) : (
            // Graceful fallback if a photo file is ever missing.
            <div className="flex h-full w-full items-center justify-center bg-navy-700">
              <span className="font-display text-6xl font-extrabold text-gold/30">RB</span>
            </div>
          )}

          {/* role chip */}
          <span className="absolute left-4 top-4 rounded-full border border-gold/40 bg-navy-900/80 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-eyebrow text-gold-contrast backdrop-blur-sm">
            {owner.role}
          </span>
        </div>

        <div className="relative p-5 sm:p-6">
          {/* oversized monogram watermark */}
          <span
            className="pointer-events-none absolute -right-2 -top-4 font-display text-[5.5rem] font-extrabold leading-none text-white/[0.045]"
            aria-hidden="true"
          >
            {owner.name.charAt(0)}
          </span>

          <h3 className="relative font-display text-[22px] font-extrabold leading-tight text-white sm:text-[25px]">
            {owner.name}
          </h3>

          <div className="mt-2 flex items-center gap-2.5">
            <span className="h-px w-6 bg-gold" aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-navy-200">
              {owner.company}
            </span>
          </div>

          {instagram ? (
            <a
              href={instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md text-[11.5px] font-bold text-navy-200 transition-colors duration-300 hover:text-gold"
            >
              <Instagram className="h-3.5 w-3.5" strokeWidth={2.2} />
              {instagram.handle}
            </a>
          ) : null}
        </div>
      </motion.article>
    </Reveal>
  );
}
