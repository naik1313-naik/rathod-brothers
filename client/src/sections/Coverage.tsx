/**
 * Interactive Karnataka coverage section.
 *
 * A stylised, non-precise service-area visual: a rough state silhouette with
 * animated route lines, pulsing location nodes and a marker travelling the
 * routes. It is explicitly a service-area illustration, not a navigational map
 * — no districts or cities are labelled, because none have been confirmed.
 */
import { motion } from 'motion/react';
import { MapPin, Navigation, Truck, Wrench } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal } from '@/components/motion';
import { usePrefersReducedMotion } from '@/hooks';

const CAPABILITIES = [
  {
    icon: Truck,
    title: 'Local Transport',
    body: 'Short-haul material movement within the district and nearby areas.',
  },
  {
    icon: Navigation,
    title: 'Statewide Transport',
    body: 'Long-distance project movement across Karnataka.',
  },
  {
    icon: Wrench,
    title: 'Earthmoving Support',
    body: 'Excavator and JCB support for digging, levelling and site work.',
  },
  {
    icon: MapPin,
    title: 'Site Clearance',
    body: 'Clearing and preparing sites for construction to begin.',
  },
];

export function Coverage(): JSX.Element {
  return (
    <section id="coverage" className="on-dark relative overflow-hidden bg-navy-900 py-20 sm:py-24 lg:py-32">
      <div className="grid-overlay-dark" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(241,189,24,0.13),transparent_62%)]"
        aria-hidden="true"
      />

      <div className="shell relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* --- visual --- */}
          <Reveal direction="right" amount={0.2}>
            <CoverageVisual />
          </Reveal>

          {/* --- copy --- */}
          <div>
            <SectionHeading
              eyebrow="Coverage"
              title="From a single site to"
              accent="statewide movement."
              onDark
            />

            <Reveal direction="up" delay={0.14} amount={0.2}>
              <p className="mt-6 max-w-prose text-[15px] leading-[1.75] text-navy-200">
                Tell us the pickup point, the destination and what needs moving or working on, and
                we will tell you what it takes. Short-haul or statewide, one site or several, the
                same direct process.
              </p>
            </Reveal>

            <div className="mt-9 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/8 sm:grid-cols-2">
              {CAPABILITIES.map((capability, index) => (
                <Reveal key={capability.title} direction="up" delay={0.08 * index} duration={0.6} amount={0.15}>
                  <div className="group h-full bg-navy-800 p-5 transition-colors duration-300 hover:bg-navy-700">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 transition-colors duration-300 group-hover:border-gold group-hover:bg-gold">
                        <capability.icon
                          className="h-4 w-4 text-gold-contrast transition-colors duration-300 group-hover:text-navy-800"
                          strokeWidth={2.2}
                        />
                      </span>
                      <h3 className="font-display text-[14.5px] font-extrabold text-white">
                        {capability.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-[12.5px] leading-relaxed text-navy-300">{capability.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function CoverageVisual(): JSX.Element {
  const reduced = usePrefersReducedMotion();

  /**
   * Rough Karnataka silhouette. Intentionally stylised — this conveys "we work
   * across this state" without implying survey-grade accuracy.
   */
  const OUTLINE =
    'M232 44 L286 62 L318 96 L360 118 L392 152 L404 196 L428 226 L420 268 L444 300 L430 340 ' +
    'L448 372 L424 404 L436 440 L406 470 L368 486 L330 474 L296 496 L258 486 L222 500 L188 480 ' +
    'L152 486 L128 458 L104 424 L112 388 L92 356 L108 322 L96 286 L116 254 L104 220 L126 188 ' +
    'L124 148 L150 118 L164 84 L196 66 Z';

  const routes = [
    'M150 200 C 230 178, 268 240, 330 214 S 392 186, 420 240',
    'M186 330 C 250 306, 300 356, 356 330 S 404 300, 428 352',
    'M226 428 C 268 404, 320 442, 372 420',
  ];

  const nodes = [
    { cx: 150, cy: 200, delay: 0 },
    { cx: 330, cy: 214, delay: 0.5 },
    { cx: 268, cy: 330, delay: 1 },
    { cx: 428, cy: 352, delay: 1.5 },
    { cx: 320, cy: 436, delay: 2 },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-navy-700 to-navy-900 p-5 shadow-card-lg sm:p-7">
      {/* grid + glow */}
      <div className="grid-overlay-dark" aria-hidden="true" />

      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-navy-300">
          Service Area // Visualisation
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Karnataka
        </span>
      </div>

      <svg
        viewBox="80 20 400 500"
        className="relative mt-2 w-full"
        role="img"
        aria-label="Stylised map of Karnataka with animated transport routes and location markers, indicating our service area"
      >
        <defs>
          <linearGradient id="cv-fill" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#1d4f78" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0a2237" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="cv-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1bd18" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f1bd18" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* state shape */}
        <path d={OUTLINE} fill="url(#cv-fill)" stroke="url(#cv-stroke)" strokeWidth="2.5" />

        {/* internal boundary lines — decorative, not administrative claims */}
        <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" fill="none">
          <path d="M120 260 H430 M112 330 H436 M140 400 H424 M180 160 H400" />
          <path d="M220 60 V490 M300 70 V490 M370 130 V470" />
        </g>

        {/* routes */}
        {routes.map((d, index) => (
          <g key={d}>
            <path
              d={d}
              fill="none"
              stroke="#f1bd18"
              strokeOpacity="0.28"
              strokeWidth="2"
              strokeDasharray="7 9"
            >
              {!reduced ? (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-64"
                  dur={`${2.6 + index * 0.5}s`}
                  repeatCount="indefinite"
                />
              ) : null}
            </path>
            <path d={d} fill="none" stroke="none" id={`cv-route-${index}`} />
            {/* travelling marker */}
            <circle r="4" fill="#f1bd18">
              <animateMotion
                dur={`${7 + index * 1.6}s`}
                repeatCount="indefinite"
                begin={`${index * 1.2}s`}
              >
                <mpath href={`#cv-route-${index}`} />
              </animateMotion>
              {!reduced ? <animate attributeName="opacity" values="1;0.3;1" dur="1.9s" repeatCount="indefinite" /> : null}
            </circle>
          </g>
        ))}

        {/* location nodes */}
        {nodes.map((node, index) => (
          <g key={index}>
            <circle cx={node.cx} cy={node.cy} r="4.5" fill="#f1bd18" />
            {!reduced ? (
              <circle cx={node.cx} cy={node.cy} r="4.5" fill="none" stroke="#f1bd18" strokeWidth="1.5">
                <animate
                  attributeName="r"
                  values="4.5;20"
                  dur="2.6s"
                  begin={`${node.delay}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.75;0"
                  dur="2.6s"
                  begin={`${node.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
          </g>
        ))}

        {/* state label */}
        <text
          x="272"
          y="290"
          textAnchor="middle"
          fontFamily="Manrope, system-ui, sans-serif"
          fontSize="27"
          fontWeight="800"
          letterSpacing="3"
          fill="#ffffff"
          fillOpacity="0.9"
          transform="rotate(-7 272 290)"
        >
          KARNATAKA
        </text>
      </svg>

      {/* bottom chips */}
      <div className="relative mt-1 grid grid-cols-2 gap-2.5">
        {['Local Transport', 'Statewide Transport', 'Earthmoving Support', 'Site Clearance'].map(
          (chip, index) => (
            <motion.div
              key={chip}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.1 + index * 0.07, duration: 0.5 }}
              className="rounded-lg border border-white/10 bg-navy-900/60 px-3 py-2.5 text-center"
            >
              <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-white">
                {chip}
              </span>
            </motion.div>
          ),
        )}
      </div>

      <p className="relative mt-4 text-[10.5px] leading-relaxed text-navy-300">
        Illustrative service-area visualisation. Exact project locations are confirmed directly with
        you before dispatch.
      </p>
    </div>
  );
}
