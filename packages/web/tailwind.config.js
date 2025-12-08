/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--color-canvas)',
          light: '#F5F7FA',
          dark: '#0F0F1A',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          light: '#FFFFFF',
          dark: '#1A1A2E',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: '#E2E8F0',
          dark: '#2D2D3A',
        },
        txt: {
          DEFAULT: 'var(--color-txt)',
          light: '#1A1A2E',
          dark: '#FFFFFF',
          muted: 'var(--color-txt-muted)',
        },
        primary: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#065F46',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs-a11y': ['0.875rem', { lineHeight: '1.5' }],
        'sm-a11y': ['1rem', { lineHeight: '1.5' }],
        'base-a11y': ['1.125rem', { lineHeight: '1.6' }],
        'lg-a11y': ['1.25rem', { lineHeight: '1.6' }],
        'xl-a11y': ['1.5rem', { lineHeight: '1.4' }],
        '2xl-a11y': ['1.875rem', { lineHeight: '1.3' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionProperty: {
        'colors-smooth': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
