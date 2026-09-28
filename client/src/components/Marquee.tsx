/**
 * Infinite horizontal marquee.
 *
 * The track is duplicated and translated by exactly -50%, which makes the loop
 * seamless regardless of content width. Pauses on hover so it stays readable.
 */
import { ChevronsRight } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks';

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Reverses direction; useful for stacking two bands in opposite directions. */
  reverse?: boolean;
  durationSeconds?: number;
}

export function Marquee({
  items,
  className = '',
  reverse = false,
  durationSeconds = 34,
}: MarqueeProps): JSX.Element {
  const reduced = usePrefersReducedMotion();

  if (items.length === 0) return <></>;

  // Duplicated so the -50% translation lands exactly on the copy boundary.
  const track = [...items, ...items];

  return (
    <div
      className={`group relative flex overflow-hidden border-y border-navy-600/25 bg-gold py-3.5 ${className}`}
      aria-hidden="true"
    >
      <div
        className="flex w-max shrink-0 items-center gap-8 whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
        style={
          reduced
            ? undefined
            : {
                animation: `marquee ${durationSeconds}s linear infinite${
                  reverse ? ' reverse' : ''
                }`,
              }
        }
      >
        {track.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8">
            <span className="font-display text-[12px] font-extrabold uppercase tracking-eyebrow text-navy-700 sm:text-[13px]">
              {item}
            </span>
            <ChevronsRight className="h-3.5 w-3.5 text-navy-800/50" strokeWidth={2.5} />
          </span>
        ))}
      </div>
    </div>
  );
}
