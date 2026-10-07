import { FREQUENCY_LABELS } from '../../domain/donation'
import { formatMoney } from '../../lib/format'
import { useDonationState } from '../../donation/context'
import { pricingOf } from '../../donation/machine'

/**
 * The running total, shown above every step after the amount is chosen.
 *
 * Who absorbs the processor fee is stated explicitly, because "the campaign
 * receives X" is the number donors actually care about.
 */
export function PlanStrip() {
  const state = useDonationState()
  const pricing = pricingOf(state)
  const monthly = state.frequency === 'monthly'

  const badge =
    pricing.fee === 0
      ? '0% platform fee'
      : state.coverFee
        ? 'Fee covered'
        : 'Campaign absorbs fee'

  return (
    <div className="plan-strip">
      <div className="plan-left">
        <p className="kicker">Selected campaign</p>
        <div className="pills">
          <span className="pill pill--dark">{state.campaign.title}</span>
          <span className="pill">{FREQUENCY_LABELS[state.frequency]}</span>
        </div>
      </div>

      <div className="plan-right">
        <p className="tiny">Total donation</p>
        <p className="big">
          {formatMoney(pricing.total)}
          {monthly && <span className="per"> / month</span>}
        </p>
        <div className="plan-note">
          <span className="pill pill--gold">{badge}</span>
          <span className="muted">
            Campaign receives {formatMoney(pricing.received)}
          </span>
        </div>
      </div>
    </div>
  )
}
