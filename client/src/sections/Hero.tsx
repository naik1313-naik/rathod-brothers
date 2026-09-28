/**
 * Cinematic full-height hero.
 *
 * Layered, back to front:
 *   1. navy gradient + engineering grid
 *   2. oversized ghosted wordmark (parallax)
 *   3. headline, copy, CTAs (staggered entrance)
 *   4. the animated machinery scene, tilted in 3D with pointer parallax
 *   5. foreground stat rail
 *
 * Pointer parallax is spring-damped and disabled on touch and under reduced
 * motion, so it never fights scrolling on a phone.
 */
import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';
import { MachineryScene } from '@/components/MachineryScene';
import { Magnetic } from '@/components/motion';
import { business } from '@/lib/business';
import { telHref } from '@/lib/links';
import { usePrefersReducedMotion, useIsDesktopPointer } from '@/hooks';

const TRUST_POINTS = [
  { title: 'Local & State-wide', detail: 'Tipper Transport' },
  { title: 'Sale & Service', detail: 'Excavators' },
  { title: 'Site Ready', detail: 'JCB Earthmoving' },
];

export function Hero(): JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const finePointer = useIsDesktopPointer();
  const enableParallax = finePointer && !reduced;

  // Slow drift as the hero scrolls out — depth without distraction.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const ghostY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  // Pointer-driven 3D on the scene. Raw -0.5..0.5 offsets, smoothed by springs.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(rawX, { stiffness: 80, damping: 20, mass: 0.6 });
  const rotateX = useSpring(rawY, { stiffness: 80, damping: 20, mass: 0.6 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!enableParallax) return;
    const rect = event.currentTarget.getBoundingClientRect();
    // Normalise to -0.5..0.5 from the element's centre.
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 9);
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * -7);
  };

  const handlePointerLeave = (): void => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="on-dark relative flex min-h-[100svh] items-center overflow-hidden bg-navy-800 pb-16 pt-28 sm:pb-20 lg:pb-24 lg:pt-32"
    >
      {/* ---- background layers ---- */}
      <div className="absolute inset-0 bg-navy-vertical" aria-hidden="true" />
      <div className="grid-overlay-dark" aria-hidden="true" />

      {/* gold light bloom, top right */}
      <motion.div
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(241,189,24,0.20),transparent_65%)]"
        aria-hidden="true"
        animate={reduced ? undefined : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* oversized ghosted wordmark */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[6%] select-none overflow-hidden"
        aria-hidden="true"
        style={reduced ? undefined : { y: ghostY }}
      >
        <p className="whitespace-nowrap text-center font-display text-[19vw] font-extrabold leading-none tracking-[-0.04em] text-white/[0.035]">
          RATHOD BROTHERS
        </p>
      </motion.div>

      {/* ---- content ---- */}
      <div className="shell relative z-10 w-full">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1.06fr] lg:gap-14">
          {/* Copy */}
          <motion.div style={reduced ? undefined : { y: copyY, opacity: fade }}>
            <motion.div
              className="inline-flex items-center gap-2.5 rounded-full border border-gold/35 bg-gold/10 px-4 py-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              <span className="text-[9.5px] font-extrabold uppercase tracking-eyebrow text-gold-contrast">
                Heavy Machinery · Transport · Earthmoving
              </span>
            </motion.div>

            <h1 className="mt-7 font-display text-display-xl text-white">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  Powering projects
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-gold-contrast"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.85, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  with machines that move.
                </motion.span>
              </span>
            </h1>

            <motion.p
              className="mt-7 max-w-xl text-[15px] leading-[1.75] text-navy-100/90 sm:text-[17px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              Reliable earthmoving equipment, tipper transport and site-clearance support for projects
              across Karnataka and beyond.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
            >
              <Magnetic strength={12}>
                <a href="#contact" onClick={handleScrollTo('contact')} className="btn-gold group">
                  Get a Quote
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.6} />
                </a>
              </Magnetic>

              <a href={telHref(business.phones[0])} className="btn-ghost-on-dark group">
                <Phone className="h-4 w-4" strokeWidth={2.4} />
                Call Now
                <span className="ml-1 font-mono text-[11px] opacity-70">
                  {business.phones[0].display}
                </span>
              </a>
            </motion.div>

            {/* trust rail */}
            <motion.dl
              className="mt-12 grid max-w-xl grid-cols-1 gap-x-6 gap-y-5 border-t border-white/12 pt-8 sm:grid-cols-3"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
            >
              {TRUST_POINTS.map((point) => (
                <div key={point.title} className="border-l-2 border-gold pl-3.5">
                  <dt className="text-[12px] font-extrabold uppercase tracking-[0.05em] text-white">
                    {point.title}
                  </dt>
                  <dd className="mt-1.5 text-[11px] text-navy-200">{point.detail}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* Machinery scene — three nested layers so the entrance animation,
              the scroll parallax and the pointer tilt never fight over the
              same transform property. */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className="relative" style={reduced ? undefined : { y: sceneY }}>
              <motion.div
                className="relative"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                style={{ rotateX, rotateY, transformPerspective: 1400, transformStyle: 'preserve-3d' }}
                animate={reduced ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
              {/* gold frame glow behind the panel */}
              <div
                className="pointer-events-none absolute -inset-3 rounded-[32px] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(241,189,24,0.22),transparent_72%)]"
                aria-hidden="true"
              />

              <div className="relative overflow-hidden rounded-[26px] border border-white/12 shadow-card-lg">
                {/* top status bar */}
                <div className="flex items-center justify-between bg-navy-900/60 px-5 py-3.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-navy-200">
                    RB // Field Operations
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    Live
                  </span>
                </div>

                <MachineryScene className="block w-full" />

                {/* bottom stat strip */}
                <dl className="grid grid-cols-3 divide-x divide-white/10 bg-navy-900/60">
                  {[
                    { label: 'Service Area', value: 'Karnataka' },
                    { label: 'Core Fleet', value: 'Excavators · Tippers' },
                    { label: 'Response', value: 'Direct Call / WhatsApp' },
                  ].map((stat) => (
                    <div key={stat.label} className="px-3 py-3.5 text-center sm:px-4">
                      <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-navy-300">
                        {stat.label}
                      </dt>
                      <dd className="mt-1.5 text-[10.5px] font-bold leading-tight text-white sm:text-[11.5px]">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        className="pointer-events-none absolute bottom-7 left-6 hidden items-center gap-3 lg:flex"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-navy-300">Scroll</span>
        <span className="relative flex h-9 w-px overflow-hidden bg-white/20">
          <motion.span
            className="absolute inset-x-0 top-0 h-3 bg-gold"
            animate={reduced ? undefined : { y: [-14, 38] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  );
}

/** Anchor click handler that scrolls smoothly to a section. */
function handleScrollTo(id: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>): void => {
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
}
