/**
 * A validation or submission message. `role="alert"` so a screen reader
 * announces it, and rendered as an empty paragraph otherwise so the layout
 * does not shift when a message appears.
 */
export function FormError({ message }: { message: string | null }) {
  return (
    <p className="form-error" role="alert">
      {message ?? ''}
    </p>
  )
}
