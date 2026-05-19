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
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-hot': 'var(--accent-hot)',
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
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'console-line': 'consoleLine 0.2s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
