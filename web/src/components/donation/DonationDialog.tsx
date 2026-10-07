import { lazy, Suspense, useEffect, useRef } from 'react'
import type { Campaign } from '../../domain/campaign'
import { useDonation } from '../../donation/context'
import { DonationProvider } from '../../donation/DonationProvider'
import { STEP_TITLES, type Step } from '../../donation/machine'
import { BRAND } from '../../content/site'
import { Icon } from '../Icon'
import { Logo } from '../Logo'
import { AmountStep } from './AmountStep'
import { DoneStep } from './DoneStep'
import { MethodStep } from './MethodStep'
import { PlanStrip } from './PlanStrip'
import { RaastStep } from './RaastStep'

/**
 * The card checkout is the biggest step and most donations never reach it, so
 * it is its own chunk: the code is fetched the moment a donor picks card
 * rather than shipped to everyone who opens the dialog.
 */
const CardStep = lazy(() =>
  import('./CardStep').then((module) => ({ default: module.CardStep })),
)

/** Steps that show the running total above the panel. */
const STRIP_STEPS = new Set<Step>(['method', 'raast', 'card'])

function StepLoading() {
  return (
    <section className="panel">
      <p className="sr-only" role="status">
        Loading the card form…
      </p>
      <div className="card-soft" aria-hidden="true">
        <span className="skeleton-line skeleton-line--title" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line--short" />
        <span className="skeleton-line skeleton-line--meta" />
      </div>
    </section>
  )
}

function Surface({ onClose }: { onClose: () => void }) {
  const { state } = useDonation()
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(state.step)

  // showModal() gives modal semantics, focus trapping, an inert background
  // and Esc-to-close from the platform — none of which is worth
  // reimplementing by hand.
  useEffect(() => {
    const element = dialog.current
    if (element !== null && !element.open) element.showModal()
  }, [])

  useEffect(() => {
    const element = dialog.current
    if (element !== null) element.scrollTop = 0
  }, [state.step])

  // Moving between steps replaces the panel, which would otherwise leave
  // keyboard focus on a control that no longer exists — the browser drops it
  // to the body and a screen reader announces nothing. Focusing the new
  // step's heading announces where the donor has landed. The first render is
  // skipped: the dialog's own focus handling covers opening.
  useEffect(() => {
    if (previousStep.current === state.step) return
    previousStep.current = state.step
    heading.current?.focus()
  }, [state.step])

  return (
    <dialog
      ref={dialog}
      className="dialog"
      data-step={state.step}
      aria-labelledby="donation-title"
      // Fires when the platform closes the dialog, which is how Esc is
      // handled — no keydown listener needed.
      onClose={onClose}
      onClick={(event) => {
        // Closing on a backdrop click is decided by geometry, not by
        // event.target: a dialog in the top layer does not reliably report
        // the inner element as the target, so relying on that would close the
        // dialog on every click.
        const box = event.currentTarget.getBoundingClientRect()
        const outside =
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        if (outside) onClose()
      }}
    >
      <div className="dialog-body">
        <header className="dialog-head">
          <Logo className="logo--tile" />
          <div className="dialog-head-text">
            <p className="dialog-brand">{BRAND.name}</p>
            <h3 id="donation-title" ref={heading} tabIndex={-1}>
              {STEP_TITLES[state.step]}
            </h3>
          </div>
          <button
            className="dialog-x"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>

        {STRIP_STEPS.has(state.step) && <PlanStrip />}

        {state.step === 'amount' && <AmountStep />}
        {state.step === 'method' && <MethodStep />}
        {state.step === 'raast' && <RaastStep />}
        {state.step === 'card' && (
          <Suspense fallback={<StepLoading />}>
            <CardStep />
          </Suspense>
        )}
        {state.step === 'done' && <DoneStep onClose={onClose} />}
      </div>
    </dialog>
  )
}

/**
 * Mounting this starts a fresh flow and unmounting discards it, so there is
 * no reset path and a part-finished donation cannot leak into the next one.
 */
export function DonationDialog({
  campaign,
  onClose,
}: {
  campaign: Campaign
  onClose: () => void
}) {
  return (
    <DonationProvider campaign={campaign}>
      <Surface onClose={onClose} />
    </DonationProvider>
  )
}
