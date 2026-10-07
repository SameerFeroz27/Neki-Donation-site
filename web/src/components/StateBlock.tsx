import { Icon } from './Icon'

/**
 * The one presentation for "there is nothing here yet" and "that failed".
 * Kept generic because the donation flow and the receipt will need it too.
 */
export function StateBlock({
  tone = 'info',
  title,
  body,
  action,
}: {
  tone?: 'info' | 'error'
  title: string
  body?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div
      className={tone === 'error' ? 'state-block is-error' : 'state-block'}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span className="state-mark" aria-hidden="true">
        <Icon name={tone === 'error' ? 'close' : 'other'} />
      </span>
      <b>{title}</b>
      {body !== undefined && <span className="state-body">{body}</span>}
      {action !== undefined && (
        <button
          className="btn btn--ghost btn--sm"
          type="button"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
