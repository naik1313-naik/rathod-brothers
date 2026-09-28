/**
 * Reusable motion primitives.
 *
 * Every animation in the site is composed from these, which keeps motion
 * consistent and — importantly — makes `prefers-reduced-motion` a single
 * decision rather than something each section has to remember.
 */
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  type Variants,
} from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/hooks';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 34 },
  down: { x: 0, y: -34 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 },
};

interface RevealProps {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
  /** Fraction of the element that must be visible before animating. */
  amount?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'header' | 'footer';
}

/**
 * Fades and translates its children into view once, when scrolled to.
 * Disabled entirely (children render statically) under reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  direction = 'up',
  className = '',
  amount = 0.25,
  as = 'div',
}: RevealProps): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const Component = motion[as];
  const offset = OFFSET[direction];

  if (reduced) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

/**
 * Staggered container — pair with <StaggerItem> for lists and grids.
 */
export function Stagger({
  children,
  className = '',
  delay = 0,
  stagger = 0.09,
  amount = 0.18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  3D tilt                                                                    */
/* -------------------------------------------------------------------------- */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. Keep subtle — 8–12 reads premium. */
  max?: number;
  /** Lift in pixels on hover. */
  lift?: number;
  /** Adds a moving highlight that follows the pointer. */
  glare?: boolean;
}

/**
 * Pointer-driven 3D tilt with spring smoothing. Also scales very slightly on
 * hover, which is what makes it feel like a physical panel rather than a
 * rotated image.
 */
export function TiltCard({
  children,
  className = '',
  max = 9,
  lift = -6,
  glare = false,
}: TiltCardProps): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);

  const glareX = useTransform(px, (value) => `${value * 100}%`);
  const glareY = useTransform(py, (value) => `${value * 100}%`);
  // Computed at the top level, not inside JSX, so hook order is unconditional.
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]: string[]) =>
      `radial-gradient(420px circle at ${x} ${y}, rgba(255,255,255,0.16), transparent 62%)`,
  );

  if (reduced) return <div className={className}>{children}</div>;

  const handleMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = (): void => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`group relative [transform-style:preserve-3d] ${className}`}
      style={{ rotateX, rotateY }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      whileHover={{ y: lift, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {children}
      {glare ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />
      ) : null}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic button                                                            */
/* -------------------------------------------------------------------------- */
interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** How far the element drifts toward the pointer, in pixels. */
  strength?: number;
}

/**
 * Nudges its child toward the cursor. Used only on the primary hero CTA, where
 * it adds a sense of physical weight without becoming a gimmick.
 */
export function Magnetic({ children, className = '', strength = 14 }: MagneticProps): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 18, mass: 0.5 });

  if (reduced) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={(event) => {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * strength * 2);
        y.set(((event.clientY - rect.top) / rect.height - 0.5) * strength * 2);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Counter                                                                    */
/* -------------------------------------------------------------------------- */
interface CounterProps {
  value: number;
  className?: string;
  durationMs?: number;
  /** Rendered before the number, e.g. "+". */
  prefix?: string;
  suffix?: string;
}

/**
 * Counts up when scrolled into view.
 *
 * NOTE: only ever used for figures that come from the database (admin
 * dashboard counts). No invented business statistics are animated anywhere on
 * the public site.
 */
export function Counter({
  value,
  className = '',
  durationMs = 1100,
  prefix = '',
  suffix = '',
}: CounterProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = usePrefersReducedMotion();
  const motionValue = useMotionValue(0);
  const displayed = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString('en-IN'));

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(motionValue, value, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, reduced, value, durationMs, motionValue]);

  if (reduced) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{displayed}</motion.span>
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared variants                                                            */
/* -------------------------------------------------------------------------- */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
