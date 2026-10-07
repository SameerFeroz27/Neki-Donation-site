/* =========================================================
   Icons — one sprite, one component.

   Geometry is defined once in <IconSprite /> and referenced by
   <Icon name="…" />, so no path data is duplicated at usage sites and
   adding an icon is a single <symbol>. Stroke, fill and caps come from
   .ico in styles/icons.css and inherit through <use>; the duotone
   campaign icons override fill/stroke on their own paths.
   ========================================================= */

/** Every icon the app can render. Keys mirror the #i-* symbol ids. */
export type IconName =
  // ui
  | 'heart'
  | 'arrow-right'
  | 'send'
  | 'lock'
  | 'copy'
  | 'check'
  | 'calendar'
  | 'repeat'
  | 'close'
  | 'card'
  | 'mobile'
  | 'bank'
  | 'banknote'
  | 'clock'
  // campaign categories
  | 'health'
  | 'food'
  | 'water'
  | 'education'
  | 'emergency'
  | 'seasonal'
  | 'other'

export function Icon({
  name,
  className,
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      viewBox="0 0 24 24"
      // Every icon here is decorative — the label beside it carries the
      // meaning, so exposing it to assistive tech would double-read.
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#i-${name}`} />
    </svg>
  )
}

/**
 * Rendered once near the root. Order does not matter: <use> resolves
 * against the live document.
 */
export function IconSprite() {
  return (
    <svg
      className="sprite"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ---------- ui ---------- */}
      <symbol id="i-heart" viewBox="0 0 24 24">
        <path d="M12 20s-7-4.4-7-9.2a4 4 0 0 1 7-2.8 4 4 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
      </symbol>
      <symbol id="i-arrow-right" viewBox="0 0 24 24">
        <path d="M4.6 12h14.2" />
        <path d="m12.8 6 6 6-6 6" />
      </symbol>
      <symbol id="i-send" viewBox="0 0 24 24">
        <path d="M20.6 3.9 3.7 10.5l6.6 2.4 2.4 6.6Z" />
        <path d="m10.3 12.9 4.4-4.4" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="2.4" />
        <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
      </symbol>
      <symbol id="i-copy" viewBox="0 0 24 24">
        <rect x="8.6" y="8.6" width="11" height="11" rx="2.2" />
        <path d="M15.4 5.4H6.8a2.4 2.4 0 0 0-2.4 2.4v8.6" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="m5 12.6 4.4 4.4L19 7.4" />
      </symbol>
      <symbol id="i-calendar" viewBox="0 0 24 24">
        <rect x="4.4" y="6" width="15.2" height="14" rx="2.6" />
        <path d="M4.4 10.4h15.2M9 4.4v3.2M15 4.4v3.2" />
      </symbol>
      <symbol id="i-repeat" viewBox="0 0 24 24">
        <path d="M4.6 12a7.4 7.4 0 0 1 12.6-5.2M19.4 12a7.4 7.4 0 0 1-12.6 5.2" />
        <path d="M17.4 3.4v3.6h-3.6M6.6 20.6v-3.6h3.6" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 24 24">
        <path d="M7 7l10 10M17 7 7 17" />
      </symbol>
      <symbol id="i-card" viewBox="0 0 24 24">
        <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.8" />
        <path d="M2.6 10h18.8M6.6 14.6h5" />
      </symbol>
      <symbol id="i-mobile" viewBox="0 0 24 24">
        <rect x="6.8" y="2.6" width="10.4" height="18.8" rx="2.6" />
        <path d="M10.8 18.2h2.4" />
      </symbol>
      <symbol id="i-bank" viewBox="0 0 24 24">
        <path d="M2.8 9.4 12 3.8l9.2 5.6M4.8 10v8.2M9.6 10v8.2M14.4 10v8.2M19.2 10v8.2M2.8 20.4h18.4" />
      </symbol>
      {/* platform totals */}
      <symbol id="i-banknote" viewBox="0 0 24 24">
        <rect x="2.4" y="6.4" width="19.2" height="11.2" rx="2.4" />
        <circle cx="12" cy="12" r="2.7" />
        <path d="M6.2 9.6v4.8M17.8 9.6v4.8" />
      </symbol>
      <symbol id="i-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.6" />
        <path d="M12 7.3V12l3.3 2" />
      </symbol>

      {/* ---------- campaign categories, duotone ---------- */}
      <symbol id="i-health" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M12 20.2s-7.2-4.5-7.2-9.6A4.15 4.15 0 0 1 12 7.5a4.15 4.15 0 0 1 7.2 3.1c0 5.1-7.2 9.6-7.2 9.6Z"
        />
        <path d="M12 20.2s-7.2-4.5-7.2-9.6A4.15 4.15 0 0 1 12 7.5a4.15 4.15 0 0 1 7.2 3.1c0 5.1-7.2 9.6-7.2 9.6Z" />
        <path d="M5 12.4h2.8l1.4-2.5 2 4.1 1.5-2.9 1.2 1.3h5.1" />
      </symbol>
      <symbol id="i-food" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M3.9 11.4h16.2a8.1 8.1 0 0 1-16.2 0Z"
        />
        <path d="M3.9 11.4h16.2a8.1 8.1 0 0 1-16.2 0Z" />
        <path d="M5.2 15.4h13.6M8 19h8" />
      </symbol>
      <symbol id="i-water" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M12 3.6s6.1 6.4 6.1 10.4a6.1 6.1 0 0 1-12.2 0C5.9 10 12 3.6 12 3.6Z"
        />
        <path d="M12 3.6s6.1 6.4 6.1 10.4a6.1 6.1 0 0 1-12.2 0C5.9 10 12 3.6 12 3.6Z" />
        <path d="M9.3 14.6a2.7 2.7 0 0 0 2.6 2.4" />
      </symbol>
      <symbol id="i-education" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M3.6 5.6h6.3a2.4 2.4 0 0 1 2.1 1v11.2a2.6 2.6 0 0 0-2.1-.8H3.6Z"
        />
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M20.4 5.6h-6.3a2.4 2.4 0 0 0-2.1 1v11.2a2.6 2.6 0 0 1 2.1-.8h6.3Z"
        />
        <path d="M3.6 5.6h6.3a2.4 2.4 0 0 1 2.1 1v11.2a2.6 2.6 0 0 0-2.1-.8H3.6Z" />
        <path d="M20.4 5.6h-6.3a2.4 2.4 0 0 0-2.1 1v11.2a2.6 2.6 0 0 1 2.1-.8h6.3Z" />
      </symbol>
      <symbol id="i-emergency" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M3.9 12a8.1 8.1 0 1 1 16.2 0 8.1 8.1 0 0 1-16.2 0Z"
        />
        <circle cx="12" cy="12" r="8.1" />
        <path d="M12 8.3v7.4M8.3 12h7.4" />
      </symbol>
      <symbol id="i-seasonal" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M19.8 14.5A8.3 8.3 0 0 1 9.5 4.2a8.5 8.5 0 1 0 10.3 10.3Z"
        />
        <path d="M19.8 14.5A8.3 8.3 0 0 1 9.5 4.2a8.5 8.5 0 1 0 10.3 10.3Z" />
        <path d="m17.4 4.4.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z" />
      </symbol>
      {/* Fallback for a category the backend adds before the UI knows it,
          and the mark used by the empty state. */}
      <symbol id="i-other" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          stroke="none"
          opacity=".18"
          d="M12 2.6 21.4 12 12 21.4 2.6 12Z"
        />
        <path d="M12 2.6 21.4 12 12 21.4 2.6 12Z" />
        <path d="M12 6.4 17.6 12 12 17.6 6.4 12Z" />
      </symbol>
    </svg>
  )
}
