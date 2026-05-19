interface LogoMarkProps {
  size: number
  color?: string
  isLoading?: boolean
  className?: string
}

export function LogoMark({
  size,
  color = 'var(--accent)',
  isLoading = false,
  className,
}: LogoMarkProps) {
  return (
    <svg
      width={(size * 40) / 32}
      height={size}
      viewBox="0 0 40 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ color }}
    >
      <path
        d="M1.25 2.5L34 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.25 16H34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.25 29.5L34 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="34"
        cy="16"
        r="3.5"
        fill="currentColor"
        className={isLoading ? 'logo-loading-dot' : undefined}
      />
    </svg>
  )
}
