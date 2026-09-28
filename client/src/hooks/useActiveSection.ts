/**
 * Tracks which section is currently in view so the navbar can highlight the
 * active link, and exposes a `scrollToSection` helper for smooth navigation.
 */
import { useCallback, useEffect, useState } from 'react';
import { navLinks, type NavLinkId } from '@/lib/business';

export function useActiveSection(ids: readonly NavLinkId[] = navLinks.map((l) => l.id)): NavLinkId | null {
  const [active, setActive] = useState<NavLinkId | null>(ids[0] ?? null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // Track the section whose top edge is closest to a band just below the
    // navbar, which behaves better than "most visible" for long sections.
    const compute = (): void => {
      const line = window.scrollY + (window.innerHeight * 0.28);
      let current: NavLinkId | null = sections[0]?.id as NavLinkId | undefined ?? null;

      for (const section of sections) {
        const id = section.id as NavLinkId;
        if (section.offsetTop <= line) current = id;
      }

      // Pin the last section once the page is scrolled to the bottom.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        current = ids[ids.length - 1] ?? current;
      }

      setActive((previous) => (previous === current ? previous : current));
    };

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [ids]);

  return active;
}

/** Smoothly scrolls to a section, accounting for the fixed navbar. */
export function useScrollToSection(): (id: string) => void {
  return useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    const navHeight = Number.parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--rb-nav-height') || '76',
      10,
    );

    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, []);
}
