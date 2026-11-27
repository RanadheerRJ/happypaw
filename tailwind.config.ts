import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Design tokens for Happy Paw. Brand values live here (and in src/config/brand.ts
 * for copy/metadata) so the visual identity can be re-skinned in one place.
 *
 * Marketing uses a GTA VI–inspired sunset system (sand / grape / sunset / vice /
 * teal / honey) for airy light sections + deep night sections. Portal tokens
 * (cream / forest / terracotta / sage / charcoal) are preserved untouched so
 * /app, /vet and /admin keep their existing look.
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
        /* GTA VI sunset system — marketing only. Bright steps are decorative
           (blobs, particles, 3D); 600/700 steps are the AA text/button steps. */
        sand: {
          DEFAULT: '#FFF6E9',
          50: '#FFFCF4',
          100: '#FFF6E9',
          200: '#FFEDD5',
          300: '#FFE0B8',
          400: '#FFC98A',
        },
        grape: {
          DEFAULT: '#1E1033',
          50: '#F3EEFC',
          100: '#E7DEF8',
          200: '#CFC0F0',
          300: '#A78FE0',
          400: '#7B5EC9',
          500: '#4A2E8A',
          600: '#2E1A5E',
          700: '#1E1033',
          800: '#160B28',
          900: '#0E0619',
        },
        sunset: {
          DEFAULT: '#FF6B4A',
          50: '#FFF1EC',
          100: '#FFE0D6',
          200: '#FFC4B2',
          300: '#FF9E85',
          400: '#FF6B4A',
          500: '#E84E2B',
          600: '#C2451F',
          700: '#9A3414',
        },
        vice: {
          DEFAULT: '#FF2E88',
          50: '#FFEAF3',
          100: '#FFD0E5',
          200: '#FFA6CC',
          300: '#FF6FA9',
          400: '#FF2E88',
          500: '#E01A6E',
          600: '#C2185B',
          700: '#9A1047',
        },
        teal: {
          DEFAULT: '#00C2B8',
          50: '#E6FFFD',
          100: '#C4FFFB',
          200: '#8AFFF8',
          300: '#3DE8DF',
          400: '#00C2B8',
          500: '#009A92',
          600: '#007A70',
          700: '#005E56',
        },
        honey: {
          DEFAULT: '#FFB84D',
          50: '#FFF7E8',
          100: '#FFEFCB',
          200: '#FFE09A',
          300: '#FFC95E',
          400: '#FFB84D',
          500: '#E99A1F',
          600: '#B8770F',
          700: '#8A5A12',
        },
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
        soft: '0 1px 2px rgba(30,16,51,0.05), 0 8px 24px -12px rgba(30,16,51,0.16)',
        card: '0 1px 2px rgba(30,16,51,0.04), 0 18px 40px -24px rgba(30,16,51,0.26)',
        lift: '0 2px 4px rgba(30,16,51,0.05), 0 24px 48px -20px rgba(30,16,51,0.30)',
        glow: '0 0 0 1px rgba(255,110,74,0.18), 0 12px 32px -12px rgba(255,46,136,0.35)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'sunset-gradient':
          'linear-gradient(135deg, #FF6B4A 0%, #FF2E88 52%, #7B5EC9 100%)',
        'sunset-soft':
          'linear-gradient(180deg, rgba(255,107,74,0.10) 0%, rgba(255,46,136,0.08) 55%, rgba(123,94,201,0.10) 100%)',
        'night-gradient':
          'linear-gradient(180deg, #1E1033 0%, #2E1A5E 55%, #1E1033 100%)',
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
