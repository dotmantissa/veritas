interface StatCalloutProps {
  value: string
  unit?: string
  label: string
  className?: string
}

export function StatCallout({
  value,
  unit,
  label,
  className = '',
}: StatCalloutProps) {
  return (
    <div className={className}>
      <div className="flex items-end gap-2">
        <span className="font-display text-4xl leading-none tracking-[0.08em] text-accent">
          {value}
        </span>
        {unit ? (
          <span className="pb-1 text-sm text-text-secondary">{unit}</span>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </p>
    </div>
  )
}
