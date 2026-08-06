/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        /* ───────── Primary — Coral (#EC6530) ───────── */
        primary: {
          50:  '#FEF3EE',
          100: '#FDE4D6',
          200: '#FACAAD',
          300: '#F6A579',
          400: '#F17B45',
          500: '#EC6530',
          600: '#DD4A19',
          700: '#B83816',
          800: '#932F19',
          900: '#7A2918',
          950: '#42120A',
        },

        /* ───────── Secondary — Peach (#FFAE6E) ───────── */
        secondary: {
          50:  '#FFF7ED',
          100: '#FFECD4',
          200: '#FFD5A8',
          300: '#FFC18A',
          400: '#FFAE6E',
          500: '#F08830',
          600: '#D96D17',
          700: '#B55114',
          800: '#904117',
          900: '#773816',
          950: '#401A09',
        },

        /* ───────── Accent — Teal (#8FDDDF) ───────── */
        accent: {
          50:  '#F0FAFB',
          100: '#D0F1F3',
          200: '#A6E4E7',
          300: '#8FDDDF',
          400: '#48C3C9',
          500: '#2DA7AE',
          600: '#298793',
          700: '#276D78',
          800: '#265A63',
          900: '#234C54',
          950: '#123236',
        },

        /* ───────── Semantic surfaces ───────── */
        surface:    '#FFFFFF',
        background: '#FFE3E3',

        /* ───────── Text tokens ───────── */
        'text-primary':   '#2D2D2D',
        'text-secondary': '#666666',

        /* ───────── Border token ───────── */
        border: '#E8D5D5',

        /* ───────── Semantic status ───────── */
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },

        /* ───────── Legacy compat (keeps old `brand-*` refs working) ───────── */
        brand: {
          50:  '#FEF3EE',
          100: '#FDE4D6',
          200: '#FACAAD',
          300: '#F6A579',
          400: '#F17B45',
          500: '#EC6530',
          600: '#DD4A19',
          700: '#B83816',
          800: '#932F19',
          900: '#7A2918',
        },
      },

      boxShadow: {
        soft:          '0 1px 3px 0 rgba(236, 101, 48, 0.06), 0 1px 2px -1px rgba(236, 101, 48, 0.06)',
        elevated:      '0 4px 24px -4px rgba(236, 101, 48, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 20px rgba(236, 101, 48, 0.20)',
        'glow-accent':  '0 0 20px rgba(143, 221, 223, 0.25)',
      },

      borderRadius: {
        '2xl': '16px',
        xl:    '12px',
        lg:    '10px',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
