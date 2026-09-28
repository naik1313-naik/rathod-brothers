import type { Config } from 'tailwindcss';

/**
 * Rathod Brothers design tokens.
 *
 * The palette is taken directly from the existing site's CSS so the new build is
 * visually identical in brand terms to what you already had:
 *   navy   #0a3158   gold  #f1bd18   off-white #f4f0e7
 * plus the deeper navy used for dark sections and the ink tone for body copy.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a3158',
          50: '#eef3f8',
          100: '#d6e2ee',
          200: '#adc5de',
          300: '#7ba1c8',
          400: '#4a7bad',
          500: '#245d92',
          600: '#0a3158',
          700: '#082845',
          800: '#061c30',
          900: '#04121f',
          950: '#020a12',
        },
        gold: {
          DEFAULT: '#f1bd18',
          light: '#f8d75c',
          pale: '#fde9a6',
          dark: '#d59b00',
          deep: '#a87c05',
        },
        sand: {
          DEFAULT: '#f4f0e7',
          50: '#fbf9f4',
          100: '#f4f0e7',
          200: '#ebe4d4',
          300: '#ddd3bd',
          400: '#c9bda2',
        },
        ink: {
          DEFAULT: '#142335',
          soft: '#51606d',
          mute: '#76818a',
          faint: '#9aa4ab',
        },
      },
      fontFamily: {
        // Manrope for the oversized display type, Inter for everything else.
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Fluid display sizes — scale with the viewport, no media-query jumps.
        'display-xl': ['clamp(2.75rem, 7.2vw, 6.5rem)', { lineHeight: '0.92', letterSpacing: '-0.05em' }],
        'display-lg': ['clamp(2.25rem, 5.2vw, 4.25rem)', { lineHeight: '0.96', letterSpacing: '-0.045em' }],
        'display-md': ['clamp(1.85rem, 3.6vw, 3rem)', { lineHeight: '1', letterSpacing: '-0.035em' }],
        'display-sm': ['clamp(1.4rem, 2.4vw, 2rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
      },
      letterSpacing: {
        eyebrow: '0.18em',
        wide2: '0.14em',
      },
      maxWidth: {
        shell: '1240px',
        prose: '62ch',
      },
      boxShadow: {
        card: '0 18px 44px -22px rgba(10, 49, 88, 0.45)',
        'card-lg': '0 34px 80px -34px rgba(10, 49, 88, 0.55)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.08)',
        gold: '0 14px 34px -16px rgba(241, 189, 24, 0.6)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(rgba(10,49,88,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(10,49,88,0.055) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
        'navy-vertical': 'linear-gradient(170deg, #0d2c48 0%, #0a3158 42%, #061c30 100%)',
        'gold-sheen': 'linear-gradient(120deg, #f8d75c 0%, #f1bd18 45%, #d59b00 100%)',
      },
      backgroundSize: {
        grid: '56px 56px',
        'grid-sm': '28px 28px',
      },
      transitionTimingFunction: {
        industrial: 'cubic-bezier(0.22, 1, 0.36, 1)',
        mech: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-1000' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.15' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.24,0,0.38,1) infinite',
        float: 'float 6s ease-in-out infinite',
        'dash-flow': 'dash-flow 14s linear infinite',
        blink: 'blink 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
