/**
 * Custom cursor — desktop pointers only.
 *
 * Two elements: a small dot that tracks 1:1, and a larger ring that lags behind
 * for a sense of weight. The ring expands and turns gold over anything
 * interactive, which is the only feedback it provides.
 *
 * Positions are written with transform-only updates inside a single
 * requestAnimationFrame loop, so moving the cursor never triggers layout or
 * repaint. Entirely absent on touch/tablet and under reduced motion.
 */
import { useEffect, useRef, useState } from 'react';
import { useIsDesktopPointer, usePrefersReducedMotion } from '@/hooks';

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, summary, [data-cursor-interactive]';

export function CustomCursor(): JSX.Element | null {
  const enabled = useIsDesktopPointer();
  const reduced = usePrefersReducedMotion();

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [overInteractive, setOverInteractive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let frame = 0;

    const onMove = (event: PointerEvent): void => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      setVisible(true);
      setOverInteractive(Boolean((event.target as Element | null)?.closest?.(INTERACTIVE_SELECTOR)));
    };

    const onLeave = (): void => setVisible(false);
    const onEnter = (): void => setVisible(true);

    // The dot is written directly in the event handler; the ring is eased
    // toward the pointer inside the rAF loop.
    const render = (): void => {
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    frame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      cancelAnimationFrame(frame);
    };
  }, [enabled, reduced]);

  // Only take the native cursor away once ours is actually mounted, so the OS
  // pointer is never lost if this component fails to initialise.
  useEffect(() => {
    if (!enabled || reduced) return;
    document.documentElement.style.cursor = 'none';
    return () => {
      document.documentElement.style.cursor = '';
    };
  }, [enabled, reduced]);

  if (!enabled || reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[150]">
      <div
        ref={ringRef}
        className={`absolute left-0 top-0 rounded-full border transition-[width,height,background-color,border-color,opacity] duration-200 ease-industrial ${
          overInteractive ? 'h-14 w-14 border-gold/90 bg-gold/10' : 'h-9 w-9 border-navy-600/45 bg-transparent'
        } ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={dotRef}
        className={`absolute left-0 top-0 h-1.5 w-1.5 rounded-full transition-[background-color,opacity] duration-200 ${
          overInteractive ? 'bg-gold opacity-100' : 'bg-navy-600 opacity-90'
        } ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
