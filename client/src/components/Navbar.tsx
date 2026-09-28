/**
 * Sticky site header.
 *
 * Transparent over the hero, then condenses into a solid navy bar once scrolled.
 * The mobile drawer is a full-height panel with staggered link reveals and locks
 * body scroll while open.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Phone, X } from 'lucide-react';
import { LogoLockup } from './Logo';
import { navLinks, business } from '@/lib/business';
import { telHref } from '@/lib/links';
import { useActiveSection, useScrollToSection } from '@/hooks/useActiveSection';
import { useScrolled, useScrollLock, usePrefersReducedMotion } from '@/hooks';

export function Navbar(): JSX.Element {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(40);
  const active = useActiveSection();
  const scrollToSection = useScrollToSection();
  const reduced = usePrefersReducedMotion();

  useScrollLock(open);

  // Close the drawer if the viewport grows to desktop while it is open.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (event: MediaQueryListEvent): void => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [open]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleNavigate = (id: string): void => {
    setOpen(false);
    // Let the drawer start closing before scrolling for a cleaner transition.
    window.setTimeout(() => scrollToSection(id), reduced ? 0 : 120);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ease-industrial ${
          scrolled || open
            ? 'bg-navy-700/95 shadow-[0_10px_40px_-18px_rgba(2,10,18,0.8)] backdrop-blur-md'
            : 'bg-gradient-to-b from-navy-900/70 to-transparent'
        }`}
      >
        <div className="shell">
          <div
            className={`flex items-center justify-between transition-all duration-500 ease-industrial ${
              scrolled ? 'h-[64px]' : 'h-[76px]'
            }`}
          >
            {/* Brand — becomes the light lockup once the bar is solid */}
            <a
              href="#home"
              onClick={(event) => {
                event.preventDefault();
                handleNavigate('home');
              }}
              className="rounded-md"
              aria-label={`${business.name} — home`}
            >
              <LogoLockup
                variant={scrolled || open ? 'dark' : 'light'}
                showTagline={!scrolled}
                className="transition-all duration-500"
              />
            </a>

            {/* Desktop navigation */}
            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const isActive = active === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavigate(link.id);
                    }}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative px-3.5 py-2 text-[12.5px] font-bold uppercase tracking-[0.06em] transition-colors duration-300 ${
                      scrolled || open
                        ? isActive
                          ? 'text-gold'
                          : 'text-navy-100 hover:text-white'
                        : isActive
                          ? 'text-gold'
                          : 'text-white/85 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-gold"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    ) : null}
                  </a>
                );
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2.5 lg:flex">
              <a
                href={telHref(business.phones[0])}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white/90 transition-all duration-300 hover:border-gold hover:bg-gold hover:text-navy-800"
                aria-label={`Call ${business.phones[0].display}`}
              >
                <Phone className="h-4 w-4" strokeWidth={2.4} />
              </a>
              <a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigate('contact');
                }}
                className="btn-gold btn-sm"
              >
                Get a Quote
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/25 text-white transition-colors duration-300 hover:border-gold hover:text-gold lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" strokeWidth={2.4} /> : <Menu className="h-5 w-5" strokeWidth={2.4} />}
            </button>
          </div>
        </div>

        {/* Gold progress hairline — a subtle "movement" cue as you scroll */}
        <div className="h-px w-full bg-white/10">
          <ScrollProgress />
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            className="fixed inset-0 z-[95] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              tabIndex={-1}
            />

            <motion.nav
              aria-label="Mobile"
              className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-navy-700 pb-8 pt-[76px] shadow-2xl"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="shell flex flex-col gap-1 pt-4">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.id}
                    href={link.href}
                    onClick={(event) => {
                      event.preventDefault();
                      handleNavigate(link.id);
                    }}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * index + 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex items-center justify-between border-b border-white/10 py-4 font-display text-lg font-extrabold uppercase tracking-tight transition-colors ${
                      active === link.id ? 'text-gold' : 'text-white hover:text-gold'
                    }`}
                  >
                    {link.label}
                    <span className="font-mono text-[10px] text-navy-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </motion.a>
                ))}

                <motion.div
                  className="mt-6 grid gap-2.5"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <a href="#contact" onClick={(event) => { event.preventDefault(); handleNavigate('contact'); }} className="btn-gold w-full">
                    Get a Quote
                  </a>
                  <a href={telHref(business.phones[0])} className="btn-ghost-on-dark w-full">
                    <Phone className="h-4 w-4" strokeWidth={2.4} />
                    {business.phones[0].display}
                  </a>
                </motion.div>
              </div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** 1px scroll-progress indicator, driven with a transform (no layout). */
function ScrollProgress(): JSX.Element | null {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = (): void => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };

    const onScroll = (): void => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        update();
        frame = 0;
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="h-px origin-left bg-gold"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  );
}
