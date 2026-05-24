import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',
        'bg-input': 'var(--bg-input)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-hot': 'var(--accent-hot)',
        'accent-hot-soft': 'var(--accent-hot-soft)',
        'accent-subtle': 'var(--accent-subtle)',
        'status-open': 'var(--status-open)',
        'status-resolving': 'var(--status-resolving)',
        'status-resolved': 'var(--status-resolved)',
        'status-disputed': 'var(--status-disputed)',
        'status-cancelled': 'var(--status-cancelled)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        'card-elevated':
          '0 18px 38px -22px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.035)',
        'accent-glow':
          '0 24px 60px -28px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'hot-glow':
          '0 24px 60px -28px var(--accent-hot-glow), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeUp: {
          from: {
            opacity: '0',
            transform: 'translateY(16px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        consoleLine: {
          from: {
            opacity: '0',
            transform: 'translateX(-8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        floatOrb: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -18px, 0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'console-line': 'consoleLine 0.2s ease forwards',
        'float-orb': 'floatOrb 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
