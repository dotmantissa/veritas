import { LogoMark } from './LogoMark'

interface LogoStackedProps {
  size?: number
  className?: string
}

export function LogoStacked({
  size = 64,
  className,
}: LogoStackedProps) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center gap-2 ${className ?? ''}`.trim()}
    >
      <LogoMark size={size} />
      <span
        className="font-display uppercase tracking-[0.08em] text-accent"
        style={{ fontSize: `${Math.round(size * 0.75)}px`, lineHeight: 1 }}
      >
        Veritas
      </span>
    </span>
  )
}
