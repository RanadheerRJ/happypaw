import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Design tokens for Happy Paw. Brand values live here (and in src/config/brand.ts
 * for copy/metadata) so the visual identity can be re-skinned in one place.
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF7F0',
          50: '#FEFCF8',
          100: '#FBF7F0',
          200: '#F5EEE2',
          300: '#EDE1CF',
          400: '#DFCEB6',
        },
        forest: {
          DEFAULT: '#1F3D2B',
          50: '#F2F6F3',
          100: '#DEEAE1',
          200: '#BBD3C3',
          300: '#8FB39C',
          400: '#628C73',
          500: '#446B52',
          600: '#2F523C',
          700: '#1F3D2B',
          800: '#17301F',
          900: '#0E2014',
        },
        terracotta: {
          DEFAULT: '#D96C3F',
          50: '#FDF4EF',
          100: '#FAE4D9',
          200: '#F3C5B0',
          300: '#E99F7F',
          400: '#D96C3F',
          500: '#C2552B',
          600: '#A04422',
          700: '#7C351B',
        },
        sage: {
          DEFAULT: '#A8C3A0',
          50: '#F4F8F2',
          100: '#E6EFE1',
          200: '#D3E3CB',
          300: '#A8C3A0',
          400: '#87AC7D',
          500: '#6A8F60',
        },
        charcoal: {
          DEFAULT: '#2B2B2B',
          700: '#3A3A38',
          600: '#4C4C46',
          500: '#5E5E57',
          400: '#6E6E66',
        },
        ink: '#1C2A21',
      },
      fontFamily: {
        display: ['"Manrope Variable"', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces Variable"', 'Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(31,61,43,0.05), 0 8px 24px -12px rgba(31,61,43,0.18)',
        card: '0 1px 2px rgba(31,61,43,0.04), 0 18px 40px -24px rgba(31,61,43,0.28)',
        lift: '0 2px 4px rgba(31,61,43,0.05), 0 24px 48px -20px rgba(31,61,43,0.32)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'fade-in': 'fade-in 240ms ease-out',
        'accordion-down': 'accordion-down 240ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-in',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
