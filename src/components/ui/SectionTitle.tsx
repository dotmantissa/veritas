interface SectionTitleProps {
  title: string
  accentWord: string
  subtitle?: string
  className?: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function SectionTitle({
  title,
  accentWord,
  subtitle,
  className = '',
}: SectionTitleProps) {
  const pattern = new RegExp(`(${escapeRegExp(accentWord)})`, 'i')
  const parts = title.split(pattern)

  return (
    <div className={className}>
      <h2 className="font-display text-[clamp(36px,5vw,56px)] uppercase leading-none tracking-[0.08em] text-text-primary">
        {parts.map((part, index) =>
          part.toLowerCase() === accentWord.toLowerCase() ? (
            <span key={`${part}-${index}`} className="text-accent">
              {part}
            </span>
          ) : (
            <span key={`${part}-${index}`}>{part}</span>
          )
        )}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
