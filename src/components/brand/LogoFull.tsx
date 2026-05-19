import { LogoMark } from './LogoMark'

interface LogoFullProps {
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
  className?: string
}

const sizeMap = {
  sm: {
    mark: 20,
    text: '18px',
  },
  md: {
    mark: 28,
    text: '22px',
  },
  lg: {
    mark: 36,
    text: '28px',
  },
} as const

export function LogoFull({
  size = 'md',
  theme = 'dark',
  className,
}: LogoFullProps) {
  const config = sizeMap[size]
  const textColor = theme === 'light' ? 'var(--accent)' : 'var(--text-primary)'

  return (
    <span className={`inline-flex items-center gap-[10px] ${className ?? ''}`.trim()}>
      <LogoMark size={config.mark} />
      <span
        className="font-display uppercase tracking-[0.08em]"
        style={{ fontSize: config.text, color: textColor }}
      >
        Veritas
      </span>
    </span>
  )
}
