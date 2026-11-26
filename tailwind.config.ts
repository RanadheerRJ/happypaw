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
          DEFAULT: '#FAF6EE',
          50: '#FEFCF7',
          100: '#FAF6EE',
          200: '#F3ECDB',
          300: '#E9DDC6',
          400: '#DCC8A8',
        },
        forest: {
          DEFAULT: '#14402F',
          50: '#EAF2EC',
          100: '#CDE0D3',
          200: '#A3C0B0',
          300: '#749B7C',
          400: '#4F7A5E',
          500: '#386249',
          600: '#2A4F39',
          700: '#14402F',
          800: '#0F2E21',
          900: '#081C13',
        },
        terracotta: {
          DEFAULT: '#E06A3B',
          50: '#FDF3EC',
          100: '#FAE2D4',
          200: '#F3C1A8',
          300: '#EA9A76',
          400: '#E06A3B',
          500: '#C9532A',
          600: '#A83F1E',
          700: '#823017',
        },
        sage: {
          DEFAULT: '#9DBFA0',
          50: '#F2F7F2',
          100: '#E0ECE0',
          200: '#C6D8C7',
          300: '#9DBFA0',
          400: '#7FA67F',
          500: '#5E8B5D',
        },
        charcoal: {
          DEFAULT: '#2A2A28',
          700: '#3B3B38',
          600: '#4E4E48',
          500: '#61615B',
          400: '#6F6F6A',
        },
        ink: '#0B2A1C',
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
