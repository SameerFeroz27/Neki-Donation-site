import { createContext, useContext, type Dispatch } from 'react'
import type { DonationAction, DonationState } from './machine'

/**
 * State and dispatch are separate contexts on purpose.
 *
 * With one combined context, every component re-renders on every keystroke —
 * including the ones that only ever dispatch, such as the back links and the
 * Done button. Split, a dispatch-only component never re-renders at all, and
 * the dispatch value is stable for the life of the provider.
 *
 * Not exported directly: reaching into a context by hand is how the split
 * quietly stops being respected.
 */
const DonationStateContext = createContext<DonationState | null>(null)
const DonationDispatchContext = createContext<Dispatch<DonationAction> | null>(
  null,
)

export function useDonationState(): DonationState {
  const state = useContext(DonationStateContext)
  if (state === null) {
    throw new Error('useDonationState must be used inside <DonationProvider>')
  }
  return state
}

export function useDonationDispatch(): Dispatch<DonationAction> {
  const dispatch = useContext(DonationDispatchContext)
  if (dispatch === null) {
    throw new Error(
      'useDonationDispatch must be used inside <DonationProvider>',
    )
  }
  return dispatch
}

/** For the components that genuinely need both. */
export function useDonation(): {
  state: DonationState
  dispatch: Dispatch<DonationAction>
} {
  return { state: useDonationState(), dispatch: useDonationDispatch() }
}

export { DonationDispatchContext, DonationStateContext }
