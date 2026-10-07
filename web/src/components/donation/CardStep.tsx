import { memo } from 'react'
import type { Currency } from '../../donation/machine'
import { formatMoney } from '../../lib/format'
import { useDonation, useDonationDispatch } from '../../donation/context'
import { pricingOf } from '../../donation/machine'
import { PAYMENT_CONFIG, toUsd } from '../../donation/pricing'
import { cardBrand, cvcLength, type CardField } from '../../donation/validation'
import { Icon } from '../Icon'
import { Logo } from '../Logo'
import { FormError } from './FormError'

const COUNTRIES = [
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'India', label: 'India' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Other', label: 'Other' },
]

type SummaryProps = {
  campaignTitle: string
  /** Already formatted, and the only thing that differs between PKR and USD. */
  displayed: string
  monthly: boolean
  currency: Currency
}

/**
 * The checkout's left pane.
 *
 * Memoised because every keystroke in the card form produces new flow state:
 * without this, the whole summary re-renders on each digit even though none
 * of it changed. The comparison holds because every prop is a primitive and
 * the actions come from the dispatch context, which is stable.
 */
const CheckoutSummary = memo(function CheckoutSummary({
  campaignTitle,
  displayed,
  monthly,
  currency,
}: SummaryProps) {
  const dispatch = useDonationDispatch()

  return (
    <div className="co-left">
      <button
        className="back"
        type="button"
        onClick={() => dispatch({ type: 'goTo', step: 'method' })}
      >
        ← Choose payment method
      </button>

      <p className="co-merchant">
        <Logo className="logo--small-tile" />
        NEKI
      </p>

      <p className="co-label">Donate to {campaignTitle}</p>
      <p className="co-amount">
        {displayed} <span>{monthly ? 'per month' : 'once'}</span>
      </p>

      <div className="currency" role="group" aria-label="Display currency">
        {(['PKR', 'USD'] as const).map((code) => (
          <button
            key={code}
            type="button"
            className={currency === code ? 'cur on' : 'cur'}
            aria-pressed={currency === code}
            onClick={() => dispatch({ type: 'currency', value: code })}
          >
            <span className={code === 'PKR' ? 'flag-pk' : 'flag-us'}>
              {code === 'PKR' ? '₨' : '$'}
            </span>
            {code}
          </button>
        ))}
      </div>
      {/* USD is how the amount reads, not what is charged: the donation is
          always settled in PKR. */}
      <p className="rate">
        1 USD = {PAYMENT_CONFIG.usdRate.toFixed(2)} PKR. Charges vary based on
        exchange rates.
      </p>

      <div className="line-item">
        <Logo className="logo--small-tile" />
        <div>
          <b>{campaignTitle}</b>
          <small>{monthly ? 'Monthly donation' : 'One-time donation'}</small>
        </div>
        <b className="li-amt">{displayed}</b>
      </div>
    </div>
  )
})

export function CardStep() {
  const { state, dispatch } = useDonation()

  const pricing = pricingOf(state)
  const monthly = state.frequency === 'monthly'
  const submitting = state.status === 'submitting'
  const digits = state.card.number.replace(/\D/g, '')
  const brand = cardBrand(digits)
  // Amex prints a four-digit code and calls it a CID; every other network uses
  // a three-digit CVC. Naming it correctly is how the donor knows which code
  // to read off the card.
  const cvcLabel = brand === 'AMEX' ? 'CID' : 'CVC'

  const showPkr = state.currency === 'PKR'
  const displayed = showPkr
    ? formatMoney(pricing.total)
    : `$${toUsd(pricing.total).toFixed(2)}`

  const bad = (field: CardField) => state.error?.fields.includes(field) ?? false
  const cls = (isBad: boolean) => (isBad ? 'field-input bad' : 'field-input')

  // The card step has no per-field hint area, so every message — whether it
  // came from validation or from the submit itself — is shown here. `fields`
  // only decides which borders turn red.
  const formError = state.error?.message ?? null

  return (
    <section className="panel" aria-busy={submitting}>
      <div className="checkout">
        <CheckoutSummary
          campaignTitle={state.campaign.title}
          displayed={displayed}
          monthly={monthly}
          currency={state.currency}
        />

        <form
          className="co-right"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            dispatch({ type: 'submit' })
          }}
        >
          <div className="co-block">
            <p className="co-block-title">Contact information</p>
            <label className="sr-only" htmlFor="donor-email">
              Email
            </label>
            <input
              id="donor-email"
              className={cls(bad('email'))}
              type="email"
              autoComplete="email"
              placeholder="Email"
              aria-invalid={bad('email')}
              value={state.card.email}
              onChange={(event) =>
                dispatch({
                  type: 'cardField',
                  field: 'email',
                  value: event.target.value,
                })
              }
            />
          </div>

          <div className="co-block">
            <p className="co-block-title">Payment method</p>

            <div className="card-box">
              <p className="card-box-head">
                <Icon name="card" />
                Card
              </p>
              <p className="card-box-sub">Card information</p>

              <div className="card-input">
                <label className="sr-only" htmlFor="card-number">
                  Card number
                </label>
                <input
                  id="card-number"
                  className={bad('number') ? 'bad' : undefined}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 1234 1234 1234"
                  aria-invalid={bad('number')}
                  value={state.card.number}
                  onChange={(event) =>
                    dispatch({
                      type: 'cardField',
                      field: 'number',
                      value: event.target.value,
                    })
                  }
                />
                {/* Dimmed to show which network the typed number belongs to. */}
                <span className="brands" aria-hidden="true">
                  <span
                    className="b-visa"
                    style={{
                      opacity:
                        brand === 'UNKNOWN' || brand === 'VISA' ? 1 : 0.3,
                    }}
                  >
                    VISA
                  </span>
                  <span
                    className="b-mc"
                    style={{
                      opacity:
                        brand === 'UNKNOWN' || brand === 'MASTERCARD' ? 1 : 0.3,
                    }}
                  >
                    <i />
                    <i />
                  </span>
                </span>
              </div>

              <div className="card-input half">
                <label className="sr-only" htmlFor="card-exp">
                  Expiry date, month and year
                </label>
                <input
                  id="card-exp"
                  className={bad('expiry') ? 'bad' : undefined}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM / YY"
                  maxLength={7}
                  aria-invalid={bad('expiry')}
                  value={state.card.expiry}
                  onChange={(event) =>
                    dispatch({
                      type: 'cardField',
                      field: 'expiry',
                      value: event.target.value,
                    })
                  }
                />
                <label className="sr-only" htmlFor="card-cvc">
                  {cvcLabel}
                </label>
                <input
                  id="card-cvc"
                  className={bad('cvc') ? 'bad' : undefined}
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder={cvcLabel}
                  // Blocked here as well as in the reducer, so the field cannot
                  // accept a digit count the brand will then reject.
                  maxLength={cvcLength(brand)}
                  aria-invalid={bad('cvc')}
                  value={state.card.cvc}
                  onChange={(event) =>
                    dispatch({
                      type: 'cardField',
                      field: 'cvc',
                      value: event.target.value,
                    })
                  }
                />
                <span className="cvc-ico" aria-hidden="true">
                  <Icon name="card" />
                </span>
              </div>
            </div>

            <label className="co-field">
              <span>Cardholder name</span>
              <input
                className={cls(bad('name'))}
                type="text"
                autoComplete="cc-name"
                placeholder="Full name on card"
                aria-invalid={bad('name')}
                value={state.card.name}
                onChange={(event) =>
                  dispatch({
                    type: 'cardField',
                    field: 'name',
                    value: event.target.value,
                  })
                }
              />
            </label>

            <label className="co-field">
              <span>Country or region</span>
              <select
                className="field-input"
                value={state.card.country}
                onChange={(event) =>
                  dispatch({
                    type: 'cardField',
                    field: 'country',
                    value: event.target.value,
                  })
                }
              >
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <FormError message={formError} />

          <button
            className={
              submitting
                ? 'btn btn--primary btn--block btn--lg is-loading'
                : 'btn btn--primary btn--block btn--lg'
            }
            type="submit"
            disabled={submitting}
          >
            <Icon name="lock" />
            Donate {displayed}
          </button>

          <p className="fineprint lock-note">
            <Icon name="lock" />
            Encrypted and processed by our PCI-DSS compliant provider. We never
            store your card number.
          </p>
        </form>
      </div>
    </section>
  )
}
