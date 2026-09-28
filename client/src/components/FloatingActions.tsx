/**
 * Mobile sticky action bar.
 *
 * Three one-tap actions — Call, WhatsApp, Get a Quote — pinned to the bottom of
 * the viewport on small screens only. Hidden on the admin routes and whenever
 * the quote form itself is in view, so it never covers the form the visitor is
 * filling in. Adds bottom padding to the page so the last footer content stays
 * reachable.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { FileText, MessageCircle, Phone } from 'lucide-react';
import { primaryPhone } from '@/lib/business';
import { telHref, whatsappHref } from '@/lib/links';
import { useScrollToSection } from '@/hooks/useActiveSection';

export function FloatingActions(): JSX.Element | null {
  const { pathname } = useLocation();
  const scrollToSection = useScrollToSection();
  const [visible, setVisible] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  // The quote form owns the bottom of the screen in this range — get out of its way.
  const formInView = useElementInViewport('#contact');

  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }
    // Appears once the visitor is past the hero.
    const onScroll = (): void => {
      setVisible(window.scrollY > 420 && !formInView);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isAdmin, formInView]);

  if (isAdmin) return null;

  return (
    <>
      {/* keeps the footer's last row clear of the bar */}
      {!visible ? null : <div className="h-16 sm:hidden" aria-hidden="true" />}

      <AnimatePresence>
        {visible ? (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[90] border-t border-navy-600/20 bg-white/95 backdrop-blur-md sm:hidden"
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* safe-area padding for notched phones */}
            <div className="grid grid-cols-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <a
                href={telHref(primaryPhone)}
                className="flex flex-col items-center gap-1 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-navy-600 transition-colors active:bg-sand-200"
              >
                <Phone className="h-[18px] w-[18px]" strokeWidth={2.4} />
                Call
              </a>

              <a
                href={whatsappHref({}, primaryPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 border-x border-navy-600/12 py-3 text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-[#1FA855] transition-colors active:bg-sand-200"
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.4} />
                WhatsApp
              </a>

              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="flex flex-col items-center gap-1 bg-gold py-3 text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-navy-800 transition-colors active:bg-gold-dark"
              >
                <FileText className="h-[18px] w-[18px]" strokeWidth={2.4} />
                Get Quote
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/**
 * True when any part of the element matching `selector` is on screen.
 * Uses a cheap rect check rather than IntersectionObserver because this runs
 * on every scroll frame and the contact section is a single element.
 */
function useElementInViewport(selector: string): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let frame = 0;

    const check = (): void => {
      const element = document.querySelector(selector);
      if (!element) {
        setInView(false);
        return;
      }
      const rect = element.getBoundingClientRect();
      // Treat the section as "owning the screen" while its lower half is visible
      // in the lower part of the viewport.
      const visible = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.55;
      setInView(visible);
    };

    const onScroll = (): void => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        check();
        frame = 0;
      });
    };

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [selector]);

  return inView;
}
