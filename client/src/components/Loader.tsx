/**
 * Premium entry loader.
 *
 * Deliberately short (~1.5s total) so it never becomes an obstacle. The
 * animation is a mechanical progress bar plus a counter, and it is skipped
 * entirely for users who prefer reduced motion.
 *
 * The loader unmounts on its own via `onComplete`, and `App` will not render
 * page content until it has, so there is no flash of unstyled content.
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Logo } from './Logo';
import { business } from '@/lib/business';
import { usePrefersReducedMotion } from '@/hooks';

interface LoaderProps {
  onComplete: () => void;
  /** Total time on screen in ms. */
  duration?: number;
}

const STAGES = [
  { at: 0.0, label: 'Initialising' },
  { at: 0.34, label: 'Loading equipment' },
  { at: 0.68, label: 'Preparing site' },
];

export function Loader({ onComplete, duration = 1500 }: LoaderProps): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(STAGES[0]?.label ?? '');
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reduced) {
      onComplete();
      return;
    }

    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number): void => {
      const elapsed = now - startedAt;
      // Ease-out so it decelerates into 100% like a machine settling.
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      setProgress(Math.round(eased * 100));

      const current = [...STAGES].reverse().find((item) => ratio >= item.at);
      if (current) setStage(current.label);

      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      // Hold at 100% for a beat, then wipe away.
      setLeaving(true);
      window.setTimeout(onComplete, 420);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, onComplete, reduced]);

  if (reduced) return <></>;

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        className="on-dark fixed inset-0 z-[200] flex items-center justify-center bg-navy-800"
        initial={{ opacity: 1 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        role="status"
        aria-live="polite"
        aria-label={`Loading ${business.name}`}
      >
        {/* engineering grid + diagonal wipe */}
        <div className="grid-overlay-dark" />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
          initial={{ x: '-120%' }}
          animate={{ x: '420%' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        <div className="relative flex w-full max-w-sm flex-col items-center px-8">
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Logo className="h-20 w-20" variant="dark" />
          </motion.div>

          <motion.p
            className="mt-6 font-display text-lg font-extrabold uppercase tracking-[0.14em] text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            Rathod <span className="text-gold">Brothers</span>
          </motion.p>

          <motion.p
            className="mt-2 text-center text-[9px] font-bold uppercase tracking-eyebrow text-navy-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.5 }}
          >
            {business.tagline}
          </motion.p>

          {/* progress track */}
          <div className="mt-9 w-full">
            <div className="h-1 w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gold-sheen"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className="text-navy-200">{stage}</span>
              <span className="tabular-nums text-gold">{progress}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
