/**
 * The khatam (eight-point star) mark. Two rotated squares, drawn from the
 * brand colours by CSS, so it inherits whatever the surrounding text colour
 * is and never needs a second asset.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={className ? `logo ${className}` : 'logo'}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
      >
        <rect x="9.5" y="9.5" width="21" height="21" rx="3.5" />
        <rect
          x="9.5"
          y="9.5"
          width="21"
          height="21"
          rx="3.5"
          transform="rotate(45 20 20)"
        />
      </svg>
    </span>
  )
}
