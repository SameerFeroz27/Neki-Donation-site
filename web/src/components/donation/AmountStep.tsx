import { FREQUENCY_LABELS, type Frequency } from '../../domain/donation'
import { formatMoney, formatNumber } from '../../lib/format'
import { useDonation } from '../../donation/context'
import { amountOf, pricingOf } from '../../donation/machine'
import { feeAppliesTo, PAYMENT_CONFIG } from '../../donation/pricing'
import { Icon } from '../Icon'

const FREQUENCIES: Frequency[] = ['once', 'monthly']

const FREQUENCY_ICONS = { once: 'calendar', monthly: 'repeat' } as const

export function AmountStep() {
  const { state, dispatch } = useDonation()

  const amount = amountOf(state)
  const pricing = pricingOf(state)
  const monthly = state.frequency === 'monthly'
  const showFeeChoice = feeAppliesTo(state.frequency)

  return (
    <section className="panel">
      <div className="card-soft">
        <p className="kicker" id="frequency-label">
          Give once or monthly
        </p>
        <div className="seg" role="group" aria-labelledby="frequency-label">
          {FREQUENCIES.map((value) => (
            <button
              key={value}
              type="button"
              className={state.frequency === value ? 'seg-btn on' : 'seg-btn'}
              aria-pressed={state.frequency === value}
              onClick={() => dispatch({ type: 'frequency', value })}
            >
              <Icon name={FREQUENCY_ICONS[value]} />
              {FREQUENCY_LABELS[value]}
            </button>
          ))}
        </div>

        <p className="kicker mt" id="amount-label">
          Choose amount
        </p>
        <div className="presets" role="group" aria-labelledby="amount-label">
          {PAYMENT_CONFIG.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={amount === preset ? 'preset on' : 'preset'}
              aria-pressed={amount === preset}
              onClick={() =>
                dispatch({ type: 'amountText', value: String(preset) })
              }
            >
              {formatMoney(preset)}
            </button>
          ))}
        </div>

        <div className="input-money">
          <span aria-hidden="true">PKR</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label="Custom amount in rupees"
            value={state.amountText === '' ? '' : formatNumber(amount)}
            onChange={(event) =>
              dispatch({ type: 'amountText', value: event.target.value })
            }
            // Leaving the field empty should not leave the form unusable.
            onBlur={() => dispatch({ type: 'normaliseAmount' })}
          />
        </div>

        {/* Offering to cover a fee that does not apply would be a choice that
            changes nothing, so it is not offered. */}
        {showFeeChoice && (
          <label className="check">
            <input
              type="checkbox"
              checked={state.coverFee}
              onChange={(event) =>
                dispatch({ type: 'coverFee', value: event.target.checked })
              }
            />
            <span>
              Add {PAYMENT_CONFIG.processorFeePercent}% to cover processing, so
              the campaign receives the full amount.
            </span>
          </label>
        )}
      </div>

      <div className="summary">
        <span>Campaign receives</span>
        <strong>
          {formatMoney(pricing.received)}
          {monthly && ' / month'}
        </strong>
      </div>

      <button
        className="btn btn--primary btn--block btn--lg"
        type="button"
        disabled={amount < 1}
        onClick={() => dispatch({ type: 'goTo', step: 'method' })}
      >
        Continue to payment
        <Icon name="arrow-right" />
      </button>
    </section>
  )
}
