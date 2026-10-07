import { useDonationDispatch } from '../../donation/context'
import { Icon } from '../Icon'

/**
 * The Raast mark: the word in Urdu above the Latin name. Drawn from type
 * rather than an image so it needs no asset and scales with the text.
 */
export function RaastMark() {
  return (
    <span className="m-logo raast" aria-hidden="true">
      <span className="raast-mark">راست</span>
      <span className="raast-word">Raast</span>
    </span>
  )
}

export function MethodStep() {
  // Dispatch only: this step reads nothing from state, so it does not
  // re-render when the flow's state changes.
  const dispatch = useDonationDispatch()

  return (
    <section className="panel">
      <p className="disclaimer">Choose how you would like to pay.</p>

      <div className="methods">
        <button
          className="method"
          type="button"
          onClick={() => dispatch({ type: 'goTo', step: 'raast' })}
        >
          <RaastMark />
          <span className="m-title">Request to Pay</span>
          <span className="m-desc">
            Pay instantly from your bank app — no card needed.
          </span>
          <span className="tagpill">Powered by Raast</span>
        </button>

        <button
          className="method"
          type="button"
          onClick={() => dispatch({ type: 'goTo', step: 'card' })}
        >
          <span className="m-logo" aria-hidden="true">
            <Icon name="card" />
          </span>
          <span className="m-title">Credit / Debit Card</span>
          <span className="m-desc">
            Visa &amp; Mastercard, secured by 3-D Secure.
          </span>
          <span className="tagpill">Secure checkout</span>
        </button>
      </div>

      <button
        className="link-back"
        type="button"
        onClick={() => dispatch({ type: 'goTo', step: 'amount' })}
      >
        ← Change amount
      </button>
    </section>
  )
}
