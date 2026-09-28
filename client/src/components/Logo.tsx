/**
 * Rathod Brothers logo — gear-ring "RB" mark.
 *
 * Drawn as inline SVG so it stays crisp at any size, inherits the brand
 * colours, and can be recoloured for dark/light backgrounds. Reconstructed from
 * the existing brand: navy outer ring, gold inner ring, "RB" monogram.
 */
interface LogoProps {
  className?: string;
  /** Accessible label. Omit to render the logo as purely decorative. */
  title?: string;
  variant?: 'light' | 'dark';
}

export function Logo({ className = '', title, variant = 'light' }: LogoProps): JSX.Element {
  const ring = variant === 'light' ? '#0a3158' : '#ffffff';
  const monogram = variant === 'light' ? '#0a3158' : '#0a3158';
  const inner = variant === 'light' ? '#f1bd18' : '#f1bd18';

  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : 'presentation'} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}

      {/* Outer navy ring */}
      <circle cx="32" cy="32" r="30" fill="none" stroke={ring} strokeWidth="6" />
      {/* Gold inner ring */}
      <circle cx="32" cy="32" r="21" fill="none" stroke={inner} strokeWidth="3.5" />
      {/* Gear teeth — four bars bridging the rings, evoking machinery */}
      <g stroke={ring} strokeWidth="4.5" strokeLinecap="square">
        <line x1="32" y1="1" x2="32" y2="10" />
        <line x1="32" y1="54" x2="32" y2="63" />
        <line x1="1" y1="32" x2="10" y2="32" />
        <line x1="54" y1="32" x2="63" y2="32" />
        <line x1="10.6" y1="10.6" x2="16.8" y2="16.8" />
        <line x1="47.2" y1="47.2" x2="53.4" y2="53.4" />
        <line x1="53.4" y1="10.6" x2="47.2" y2="16.8" />
        <line x1="16.8" y1="47.2" x2="10.6" y2="53.4" />
      </g>

      {/* RB monogram */}
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Manrope, system-ui, sans-serif"
        fontSize="19"
        fontWeight="800"
        letterSpacing="-0.5"
        fill={monogram}
      >
        RB
      </text>
    </svg>
  );
}

interface LogoLockupProps {
  className?: string;
  variant?: 'light' | 'dark';
  /** Hide the tagline line for very tight spaces such as the mobile bar. */
  showTagline?: boolean;
}

/** Full lockup: mark + wordmark + tagline. */
export function LogoLockup({ className = '', variant = 'light', showTagline = true }: LogoLockupProps): JSX.Element {
  const wordmark = variant === 'light' ? '#0a3158' : '#ffffff';
  const accent = '#f1bd18';
  const sub = variant === 'light' ? '#76818a' : 'rgba(255,255,255,0.62)';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Logo className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" variant={variant} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className="font-display text-[15px] font-extrabold uppercase tracking-[0.06em] sm:text-[17px]"
          style={{ color: wordmark }}
        >
          Rathod <span style={{ color: accent }}>Brothers</span>
        </span>
        {showTagline ? (
          <span
            className="mt-1 truncate text-[7.5px] font-bold uppercase tracking-[0.16em] sm:text-[8.5px]"
            style={{ color: sub }}
          >
            Earthmovers &amp; Heavy Machinery Services
          </span>
        ) : null}
      </span>
    </span>
  );
}
