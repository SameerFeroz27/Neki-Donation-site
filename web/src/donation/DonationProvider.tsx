import { useEffect, useReducer, type ReactNode } from 'react'
import { isAbort } from '../api/client'
import type { Campaign } from '../domain/campaign'
import { paymentProvider } from '../payments'
import { DonationDispatchContext, DonationStateContext } from './context'
import { createInitialState, donationReducer } from './machine'
import { performDonation } from './submit'

/**
 * Owns the flow's state and performs the one side effect in it: talking to
 * whoever takes the donation.
 *
 * Mounting a provider starts a fresh flow and unmounting discards it, so no
 * reset action is needed and a half-finished donation can never leak into the
 * next one.
 */
export function DonationProvider({
  campaign,
  children,
}: {
  campaign: Campaign
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(
    donationReducer,
    campaign,
    createInitialState,
  )

  const { status, intent } = state

  // Keyed on the intent object, which is created only when a submit starts,
  // so an unrelated re-render cannot restart or cancel a donation in flight.
  useEffect(() => {
    if (status !== 'submitting' || intent === null) return

    const controller = new AbortController()

    performDonation(intent, paymentProvider(), controller.signal)
      .then((receipt) => dispatch({ type: 'submitted', receipt }))
      .catch((error: unknown) => {
        if (isAbort(error)) return
        dispatch({
          type: 'failed',
          message:
            error instanceof Error
              ? error.message
              : 'We could not complete the donation.',
        })
      })

    return () => controller.abort()
  }, [status, intent])

  // No useMemo: `state` is already a new object per state, and `dispatch` is
  // stable for the life of the provider.
  return (
    <DonationStateContext.Provider value={state}>
      <DonationDispatchContext.Provider value={dispatch}>
        {children}
      </DonationDispatchContext.Provider>
    </DonationStateContext.Provider>
  )
}
