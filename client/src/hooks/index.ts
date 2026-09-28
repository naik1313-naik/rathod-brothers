/**
 * Small, focused hooks used across the site.
 */
import { useEffect, useRef, useState } from 'react';

/** True when the user has asked the OS to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** True on devices with a precise pointer (mouse/trackpad) — gates the cursor. */
export function useIsDesktopPointer(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // `pointer: fine` excludes touch/tablet, so the custom cursor never appears
    // on a device where it would fight native touch behaviour.
    const wide = window.matchMedia('(min-width: 1024px)');
    const fine = window.matchMedia('(pointer: fine)');

    const update = (): void => setIsDesktop(wide.matches && fine.matches);
    update();

    wide.addEventListener('change', update);
    fine.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      fine.removeEventListener('change', update);
    };
  }, []);

  return isDesktop;
}

/** True once the window has scrolled past `offset` pixels. */
export function useScrolled(offset = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > offset);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [offset]);

  return scrolled;
}

/** Locks body scroll while `locked` is true (mobile menu / modal). */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { overflow, paddingRight } = document.body.style;
    // Compensate for the scrollbar so the page doesn't shift horizontally.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** Locks the page from being tabbed past while `locked` — used by the loader. */
export function useFocusTrap(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    // Simple, robust approach: make the whole document inert to keyboard users.
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    return () => root?.removeAttribute('inert');
  }, [active]);
}

/** Fires `handler` when a click lands outside the referenced element. */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled = true,
): void {
  const savedHandler = useRef(handler);
  savedHandler.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: MouseEvent | TouchEvent): void => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      savedHandler.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [ref, enabled]);
}
