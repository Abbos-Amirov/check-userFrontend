import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        'accent-soft': 'var(--color-accent-soft)',
        success: 'var(--color-success)',
        'success-soft': 'var(--color-success-soft)',
        warning: 'var(--color-warning)',
        'warning-soft': 'var(--color-warning-soft)',
        danger: 'var(--color-danger)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        bg: 'var(--color-bg)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        neutral: 'var(--color-neutral)',
        'neutral-soft': 'var(--color-neutral-soft)',
        planner: {
          ink: 'var(--planner-ink)',
          navy: 'var(--planner-navy)',
          slate: 'var(--planner-slate)',
          gold: 'var(--planner-gold)',
          'gold-dim': 'var(--planner-gold-dim)',
          cream: 'var(--planner-cream)',
          parchment: 'var(--planner-parchment)',
          line: 'var(--planner-line)',
          fog: 'var(--planner-fog)',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        nav: 'var(--shadow-nav)',
        'planner-card': 'var(--shadow-planner-card)',
        'planner-soft': 'var(--shadow-planner-soft)',
        'planner-panel': 'var(--shadow-planner-panel)',
        'planner-month-current': 'var(--shadow-planner-month-current)',
        'planner-month-active': 'var(--shadow-planner-month-active)',
      },
      maxWidth: {
        mobile: '430px',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
