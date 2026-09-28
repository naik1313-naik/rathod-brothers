/**
 * Consistent section header: eyebrow label, oversized display heading, optional
 * supporting copy. Every section on the site uses this so the vertical rhythm
 * and type scale stay uniform.
 */
import type { ReactNode } from 'react';
import { Reveal } from './motion';

interface SectionHeadingProps {
  eyebrow: string;
  /** Split across two lines for the oversized editorial look. */
  title: string;
  accent?: string;
  description?: string;
  align?: 'left' | 'center';
  /** Dark sections invert the colours. */
  onDark?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = 'left',
  onDark = false,
  className = '',
  children,
}: SectionHeadingProps): JSX.Element {
  const centered = align === 'center';

  return (
    <div
      className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}
    >
      <Reveal direction="up" duration={0.55}>
        <span className={`eyebrow ${onDark ? 'eyebrow-on-dark' : ''} ${centered ? 'justify-center' : ''}`}>
          {eyebrow}
        </span>
      </Reveal>

      <Reveal direction="up" delay={0.08} duration={0.7}>
        <h2
          className={`mt-5 text-display-lg ${onDark ? 'text-white' : 'text-navy-600'}`}
        >
          {title}
          {accent ? (
            <>
              <br />
              <span className="text-gold-contrast">{accent}</span>
            </>
          ) : null}
        </h2>
      </Reveal>

      {description ? (
        <Reveal direction="up" delay={0.16} duration={0.7}>
          <p
            className={`mt-6 max-w-prose text-[15px] leading-[1.75] sm:text-base ${
              onDark ? 'text-navy-200' : 'text-ink-soft'
            } ${centered ? 'mx-auto' : ''}`}
          >
            {description}
          </p>
        </Reveal>
      ) : null}

      {children}
    </div>
  );
}
