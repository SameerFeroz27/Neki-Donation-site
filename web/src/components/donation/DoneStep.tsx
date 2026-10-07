import { useEffect, useRef, useState } from 'react'
import { FREQUENCY_LABELS } from '../../domain/donation'
import { formatMoney } from '../../lib/format'
import { useDonationState } from '../../donation/context'
import { Icon } from '../Icon'
import { Logo } from '../Logo'

export function DoneStep({ onClose }: { onClose: () => void }) {
  // State only: the receipt is read, never changed, from here.
  const state = useDonationState()
  const receipt = state.receipt

  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  // The confirmation reverts on a timer; clear it if the dialog closes first.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  if (receipt === null) return null

  const copy = () => {
    void navigator.clipboard?.writeText(receipt.id)
    setCopied(true)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  const raast = receipt.method.startsWith('Raast')

  return (
    <section className="panel done">
      <span className="seal" aria-hidden="true">
        <Logo />
        <svg className="tick" viewBox="0 0 24 24" fill="none">
          <path
            d="m5 12.6 4.4 4.4L19 7.4"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h3>{raast ? 'Request sent' : 'Payment successful'}</h3>
      <p className="done-sub">
        {raast
          ? 'Approve the request in your bank app within 5 minutes. If it expires, you can send it again.'
          : `We charged ${formatMoney(receipt.total)} and sent a receipt to your email.`}
      </p>

      {/* A description list, because that is what a receipt is: a set of
          labels and their values, which is also how a screen reader should
          read it out. */}
      <dl className="receipt">
        <div>
          <dt>Campaign</dt>
          <dd>{receipt.campaignTitle}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd>
            {formatMoney(receipt.total)}
            {receipt.frequency === 'monthly' && ' / month'}
          </dd>
        </div>
        <div>
          <dt>Campaign receives</dt>
          <dd>{formatMoney(receipt.received)}</dd>
        </div>
        <div>
          <dt>Method</dt>
          <dd>{receipt.method}</dd>
        </div>
        <div>
          <dt>Frequency</dt>
          <dd>{FREQUENCY_LABELS[receipt.frequency]}</dd>
        </div>
        <div>
          <dt>Receipt ID</dt>
          <dd>{receipt.id}</dd>
        </div>
      </dl>

      <button
        className="btn btn--primary btn--block"
        type="button"
        onClick={copy}
      >
        <Icon name="copy" />
        {copied ? 'Copied ✓' : 'Copy receipt ID'}
      </button>

      <button
        className="btn btn--ghost btn--block"
        type="button"
        onClick={onClose}
      >
        <Icon name="check" />
        Done
      </button>
    </section>
  )
}
