import { formatMoney } from '../../lib/format'
import { useDonation } from '../../donation/context'
import { pricingOf } from '../../donation/machine'
import { RAAST_RULES, type RaastMode } from '../../donation/validation'
import { Icon } from '../Icon'
import { FormError } from './FormError'
import { RaastMark } from './MethodStep'

const MODES: { value: RaastMode; label: string; icon: 'mobile' | 'bank' }[] = [
  { value: 'mobile', label: 'Raast Mobile ID', icon: 'mobile' },
  { value: 'iban', label: 'IBAN', icon: 'bank' },
]

export function RaastStep() {
  const { state, dispatch } = useDonation()

  const pricing = pricingOf(state)
  const rule = RAAST_RULES[state.raastMode]
  const submitting = state.status === 'submitting'

  // A field error belongs under the input and replaces the hint; anything
  // else — a submit failure — belongs above the button. Splitting them keeps
  // one message from appearing twice.
  const hasFieldError = state.error?.fields.includes('raastId') ?? false
  const fieldError = hasFieldError ? (state.error?.message ?? null) : null
  const formError = hasFieldError ? null : (state.error?.message ?? null)

  return (
    <section className="panel" aria-busy={submitting}>
      <div className="details-row">
        <RaastMark />
        <div className="details-text">
          <b>Raast payment details</b>
          <p>
            Send <strong>{formatMoney(pricing.total)}</strong> from your bank
            app using the ID below.
          </p>
          <span className="tagpill">Powered by Raast</span>
        </div>
      </div>

      <div className="toggle" role="group" aria-label="Raast identifier type">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className={
              state.raastMode === mode.value ? 'toggle-btn on' : 'toggle-btn'
            }
            aria-pressed={state.raastMode === mode.value}
            onClick={() => dispatch({ type: 'raastMode', value: mode.value })}
          >
            <Icon name={mode.icon} />
            {mode.label}
          </button>
        ))}
      </div>

      <label className="sr-only" htmlFor="raast-id">
        {state.raastMode === 'mobile' ? 'Raast Mobile ID' : 'IBAN'}
      </label>
      <input
        id="raast-id"
        className={fieldError !== null ? 'field-input bad' : 'field-input'}
        type="text"
        inputMode={rule.inputMode}
        maxLength={rule.maxLength}
        autoComplete="off"
        spellCheck={false}
        placeholder={rule.placeholder}
        aria-invalid={fieldError !== null}
        aria-describedby="raast-hint"
        value={state.raastId}
        onChange={(event) =>
          dispatch({ type: 'raastId', value: event.target.value })
        }
      />
      <p className={fieldError !== null ? 'hint bad' : 'hint'} id="raast-hint">
        {fieldError ?? rule.hint}
      </p>

      <FormError message={formError} />

      <button
        className={
          submitting
            ? 'btn btn--primary btn--block btn--lg is-loading'
            : 'btn btn--primary btn--block btn--lg'
        }
        type="button"
        disabled={submitting}
        onClick={() => dispatch({ type: 'submit' })}
      >
        <Icon name="send" />
        Send request
      </button>

      <p className="fineprint">
        Approve the request in your bank app within 5 minutes. Nothing is
        charged until you approve it.
      </p>

      <button
        className="link-back"
        type="button"
        onClick={() => dispatch({ type: 'goTo', step: 'method' })}
      >
        ← Other payment methods
      </button>
    </section>
  )
}
