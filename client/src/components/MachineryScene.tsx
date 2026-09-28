/**
 * Animated machinery scene used as the hero visual.
 *
 * Drawn as SVG rather than sourced from stock photography for three reasons:
 *   1. Nothing on the page can be mistaken for a photograph of the real
 *      Rathod Brothers fleet.
 *   2. No external image request, so there is no layout shift or LCP penalty.
 *   3. The boom, arm, bucket, dust and route line can all be animated, which
 *      communicates movement and engineering far better than a static photo.
 *
 * Everything stops under `prefers-reduced-motion`.
 */
import { motion } from 'motion/react';
import { usePrefersReducedMotion } from '@/hooks';

export function MachineryScene({ className = '' }: { className?: string }): JSX.Element {
  const reduced = usePrefersReducedMotion();

  return (
    <svg
      viewBox="0 0 760 520"
      className={className}
      role="img"
      aria-label="Illustration of an excavator working a construction site, with a route line running to the horizon"
    >
      <title>Rathod Brothers — earthmoving machinery illustration</title>

      <defs>
        <linearGradient id="ms-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123a5c" />
          <stop offset="52%" stopColor="#1b5175" />
          <stop offset="100%" stopColor="#0a2237" />
        </linearGradient>
        <linearGradient id="ms-arm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd75e" />
          <stop offset="100%" stopColor="#d59b00" />
        </linearGradient>
        <linearGradient id="ms-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8d75c" />
          <stop offset="100%" stopColor="#c9930a" />
        </linearGradient>
        <linearGradient id="ms-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22323f" />
          <stop offset="100%" stopColor="#0e1820" />
        </linearGradient>
        <linearGradient id="ms-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8fc4e4" />
          <stop offset="100%" stopColor="#2a5b7c" />
        </linearGradient>
        <linearGradient id="ms-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16324a" />
          <stop offset="100%" stopColor="#081726" />
        </linearGradient>
        <radialGradient id="ms-glow" cx="0.78" cy="0.24" r="0.5">
          <stop offset="0%" stopColor="#f1bd18" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#f1bd18" stopOpacity="0" />
        </radialGradient>

        <pattern id="ms-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0H0V34" fill="none" stroke="#ffffff" strokeOpacity="0.055" strokeWidth="1" />
        </pattern>
        <pattern id="ms-dust" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.7" fill="#c8a978" />
          <circle cx="13" cy="12" r="1.3" fill="#c8a978" />
        </pattern>

        <clipPath id="ms-frame">
          <rect x="0" y="0" width="760" height="520" rx="26" />
        </clipPath>
      </defs>

      <g clipPath="url(#ms-frame)">
        <rect width="760" height="520" fill="url(#ms-sky)" />
        <rect width="760" height="520" fill="url(#ms-grid)" />
        <rect width="760" height="520" fill="url(#ms-glow)" />

        {/* --- sun / dust haze on the horizon --- */}
        {!reduced ? (
          <motion.circle
            cx="590"
            cy="120"
            r="54"
            fill="#f1bd18"
            fillOpacity="0.16"
            animate={{ cx: [580, 600, 580], r: [54, 60, 54] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <circle cx="590" cy="120" r="54" fill="#f1bd18" fillOpacity="0.16" />
        )}

        {/* --- distant terrain ridges --- */}
        <path d="M0 300 L120 262 L250 292 L390 254 L520 288 L640 258 L760 288 V400 H0 Z" fill="#0d2a41" opacity="0.9" />
        <path d="M0 330 L150 300 L300 326 L460 294 L620 322 L760 300 V420 H0 Z" fill="#0a2033" />

        {/* --- animated route line (movement) --- */}
        <g>
          <path
            d="M-20 372 C 140 340, 250 392, 400 358 S 640 322, 790 352"
            fill="none"
            stroke="#f1bd18"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeDasharray="10 12"
          >
            {reduced ? null : (
              <animate attributeName="stroke-dashoffset" from="0" to="-88" dur="2.4s" repeatCount="indefinite" />
            )}
          </path>
          {/* Tipper marker travelling the route */}
          <path id="ms-route" d="M-20 372 C 140 340, 250 392, 400 358 S 640 322, 790 352" fill="none" stroke="none" />
          <circle r="5" fill="#f1bd18">
            <animateMotion dur="11s" repeatCount="indefinite">
              <mpath href="#ms-route" />
            </animateMotion>
            <animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* --- ground --- */}
        <path d="M0 386 H760 V520 H0 Z" fill="url(#ms-ground)" />
        <path d="M0 386 H760" stroke="#f1bd18" strokeOpacity="0.22" strokeWidth="2" />
        <rect x="0" y="390" width="760" height="130" fill="url(#ms-dust)" opacity="0.14" />

        {/* --- excavator --- */}
        <g transform="translate(96 132)">
          {/* shadow */}
          <ellipse cx="215" cy="336" rx="205" ry="17" fill="#04101c" opacity="0.5" />

          {/* tracks */}
          <g>
            <rect x="18" y="286" width="330" height="62" rx="31" fill="url(#ms-dark)" stroke="#3b4f5e" strokeWidth="2.5" />
            <rect x="42" y="300" width="282" height="34" rx="17" fill="#080f15" />
            <g fill="#46596a">
              <circle cx="50" cy="317" r="11" /><circle cx="94" cy="317" r="11" />
              <circle cx="138" cy="317" r="11" /><circle cx="182" cy="317" r="11" />
              <circle cx="226" cy="317" r="11" /><circle cx="270" cy="317" r="11" />
              <circle cx="314" cy="317" r="11" />
            </g>
          </g>

          {/* slew ring */}
          <rect x="140" y="266" width="146" height="26" rx="7" fill="#1b2b37" stroke="#44586a" strokeWidth="2" />

          {/* house */}
          <path d="M122 276 V166 H288 L322 276 Z" fill="url(#ms-body)" stroke="#a87c05" strokeWidth="2.5" />
          <rect x="176" y="180" width="98" height="82" rx="5" fill="#15222d" stroke="#3c5465" strokeWidth="2" />
          <g stroke="#f1bd18" strokeOpacity="0.4" strokeWidth="2">
            <path d="M176 204 H274 M176 228 H274 M176 252 H274" />
          </g>
          <text x="225" y="298" fontFamily="ui-monospace, monospace" fontSize="17" fontWeight="700"
                fill="#0a2237" textAnchor="middle" letterSpacing="2">RB</text>

          {/* counterweight */}
          <path d="M288 166 h50 a12 12 0 0 1 12 12 V276 H288 Z" fill="#15222d" stroke="#3c5465" strokeWidth="2.5" />

          {/* cab */}
          <g>
            <path d="M172 166 V74 a9 9 0 0 1 9-9 h72 a9 9 0 0 1 9 9 V166 Z"
                  fill="url(#ms-dark)" stroke="#4a6274" strokeWidth="2.5" />
            <path d="M184 86 H250 V138 H184 Z" fill="url(#ms-glass)" />
            <path d="M184 86 L212 86 L184 110 Z" fill="#ffffff" fillOpacity="0.24" />
            <rect x="172" y="144" width="90" height="13" rx="4" fill="#f1bd18" fillOpacity="0.85" />
            <motion.circle
              cx="252" cy="62" r="7" fill="#f1bd18"
              animate={reduced ? undefined : { opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>

          {/* boom — pivots at the house */}
          <motion.g
            style={{ originX: '300px', originY: '150px' }}
            animate={reduced ? undefined : { rotate: [-13, -4, -13] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M300 150 L452 58" stroke="#0a1a24" strokeWidth="30" strokeLinecap="round" />
            <path d="M300 150 L452 58" stroke="url(#ms-arm)" strokeWidth="21" strokeLinecap="round" />
            <circle cx="300" cy="150" r="15" fill="#1b2b37" stroke="#f1bd18" strokeWidth="3.5" />
            <rect x="316" y="128" width="98" height="12" rx="6" fill="#cfd8de"
                  transform="rotate(-35 316 128)" />
          </motion.g>

          {/* arm — counter-rotates so the bucket actually digs */}
          <motion.g
            style={{ originX: '452px', originY: '58px' }}
            animate={reduced ? undefined : { rotate: [16, 42, 16] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M452 58 L586 168" stroke="#0a1a24" strokeWidth="26" strokeLinecap="round" />
            <path d="M452 58 L586 168" stroke="url(#ms-arm)" strokeWidth="18" strokeLinecap="round" />
            <circle cx="452" cy="58" r="13" fill="#1b2b37" stroke="#f1bd18" strokeWidth="3.5" />

            {/* bucket */}
            <g>
              <path d="M586 168 L640 236" stroke="#0a1a24" strokeWidth="19" strokeLinecap="round" />
              <path d="M586 168 L640 236" stroke="#d59b00" strokeWidth="12" strokeLinecap="round" />
              <path d="M622 236 h74 l-12 82 -58 4 -18 -48 z" fill="#8d6a10" stroke="#f1bd18" strokeWidth="2.5" />
              <g fill="#f1bd18">
                <path d="M626 312 l12 18 12-20z" />
                <path d="M654 316 l12 18 12-20z" />
                <path d="M682 312 l10 16 10-18z" />
              </g>
            </g>
          </motion.g>
        </g>

        {/* --- spoil pile + dust puffs --- */}
        <path d="M470 386 q64-52 128 0 z" fill="#123048" />
        <path d="M480 386 q54-40 108 0 z" fill="#17405f" />

        <g>
          {[
            { cx: 588, cy: 372, r: 15, delay: 0 },
            { cx: 612, cy: 366, r: 11, delay: 0.5 },
            { cx: 636, cy: 374, r: 9, delay: 1.1 },
            { cx: 660, cy: 368, r: 13, delay: 1.7 },
          ].map((puff, index) => (
            <motion.circle
              key={index}
              cx={puff.cx}
              cy={puff.cy}
              r={puff.r}
              fill="#d9be8c"
              animate={
                reduced
                  ? undefined
                  : { cx: puff.cx + 74, cy: puff.cy - 30, opacity: [0, 0.55, 0], scale: [0.6, 1.5] }
              }
              transition={{
                duration: 3.4,
                repeat: Infinity,
                delay: puff.delay,
                ease: 'easeOut',
              }}
              style={{ transformOrigin: `${puff.cx}px ${puff.cy}px` }}
            />
          ))}
        </g>
      </g>

      {/* frame */}
      <rect x="1" y="1" width="758" height="518" rx="26" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
    </svg>
  );
}
