/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      colors: {
        /* ── Primary — Indigo ── */
        primary: {
          DEFAULT: '#4F46E5',
          hover:   '#4338CA',
          light:   '#EEF2FF',
          subtle:  '#C7D2FE',
          50:      '#EEF2FF',
          100:     '#E0E7FF',
          200:     '#C7D2FE',
          300:     '#A5B4FC',
          400:     '#818CF8',
          500:     '#6366F1',
          600:     '#4F46E5',
          700:     '#4338CA',
          800:     '#3730A3',
          900:     '#312E81',
          950:     '#1E1B4B',
        },

        /* ── Secondary — Azure Blue ── */
        secondary: {
          DEFAULT: '#2563EB',
          light:   '#EFF6FF',
          50:      '#EFF6FF',
          100:     '#DBEAFE',
          200:     '#BFDBFE',
          300:     '#93C5FD',
          400:     '#60A5FA',
          500:     '#3B82F6',
          600:     '#2563EB',
          700:     '#1D4ED8',
          800:     '#1E40AF',
          900:     '#1E3A8A',
          950:     '#172554',
        },

        /* ── Accent — Emerald ── */
        accent: {
          DEFAULT: '#10B981',
          light:   '#ECFDF5',
          50:      '#ECFDF5',
          100:     '#D1FAE5',
          200:     '#A7F3D0',
          300:     '#6EE7B7',
          400:     '#34D399',
          500:     '#10B981',
          600:     '#059669',
          700:     '#047857',
          800:     '#065F46',
          900:     '#064E3B',
          950:     '#022C22',
        },

        /* ── Warning — Amber ── */
        warning: {
          DEFAULT: '#FF9F0A',
          light:   '#FFF8E6',
          50:      '#FFF8E6',
          100:     '#FFEFC0',
          200:     '#FFE08A',
          300:     '#FFCF4D',
          400:     '#FFB929',
          500:     '#FF9F0A',
          600:     '#E07F00',
          700:     '#B86300',
          800:     '#904C00',
          900:     '#703B00',
          950:     '#3D1E00',
        },

        /* ── Danger — Pink-Red ── */
        danger: {
          DEFAULT: '#FF375F',
          light:   '#FFEBEF',
          50:      '#FFEBEF',
          100:     '#FFD0DA',
          200:     '#FFA8BB',
          300:     '#FF7597',
          400:     '#FF5278',
          500:     '#FF375F',
          600:     '#E0193F',
          700:     '#B81432',
          800:     '#900F27',
          900:     '#700B1E',
          950:     '#3D0510',
        },

        /* ── Success — Green ── */
        success: {
          DEFAULT: '#34C759',
          light:   '#EDFBF1',
          50:      '#EDFBF1',
          100:     '#D4F5DF',
          200:     '#A8EAC0',
          300:     '#6DDA97',
          400:     '#3FCB72',
          500:     '#34C759',
          600:     '#25A845',
          700:     '#1D8436',
          800:     '#176429',
          900:     '#114D1F',
          950:     '#082B11',
        },

        /* ── Surface tokens (CSS-var-backed aliases for Tailwind classes) ── */
        surface:     'var(--color-surface)',
        background:  'var(--color-background)',
        border:      'var(--color-border)',

        /* ── Text tokens ── */
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary':  'var(--color-text-tertiary)',

        /* ── Legacy compat — keeps old `brand-*` refs working ── */
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
        card:         '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        elevated:     '0 8px 30px rgba(0,0,0,0.12)',
        nav:          '0 1px 3px rgba(0,0,0,0.06)',
        /* legacy */
        soft:         '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'glow-primary': '0 0 20px rgba(236, 101, 48, 0.20)',
        'glow-accent':  '0 0 20px rgba(48, 213, 200, 0.25)',
        'glow-secondary': '0 0 20px rgba(52, 120, 246, 0.25)',
      },

      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
        full: '9999px',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        fast:   '150ms',
        normal: '200ms',
        smooth: '300ms',
        spring: '400ms',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'scale-spring': {
          '0%':   { opacity: '0', transform: 'scale(0.88)' },
          '60%':  { opacity: '1', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',    opacity: '0.8' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
      },

      animation: {
        'fade-in':     'fade-in 0.3s ease-out both',
        'slide-up':    'slide-up 0.4s ease-out both',
        'slide-down':  'slide-down 0.3s ease-out both',
        'scale-in':    'scale-in 0.2s ease-out both',
        'scale-spring':'scale-spring 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'pulse-ring':  'pulse-ring 1.4s cubic-bezier(0.4,0,0.6,1) infinite',
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },

      maxWidth: {
        'content': '1280px',
      },
    },
  },
  plugins: [],
};
