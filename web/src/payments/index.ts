/* =========================================================
   Which provider the app talks to.

   One decision, made once per page load, in one place. Components never see
   this — they call donation/submit.ts, which asks for the provider.

   It follows the same switch as the campaign fixtures: no API configured
   means the simulator, so a deployment with no backend still has a working
   checkout to demonstrate.
   ========================================================= */
import { createHttpPaymentProvider } from './http'
import { createSimulatedPaymentProvider } from './simulated'
import type { PaymentProvider } from './types'

let instance: PaymentProvider | null = null

export function paymentProvider(): PaymentProvider {
  if (instance === null) {
    instance = __USING_FIXTURES__
      ? createSimulatedPaymentProvider()
      : createHttpPaymentProvider()
  }
  return instance
}

export type {
  CardPaymentRequest,
  CardToken,
  DonationRequest,
  PaymentProvider,
  PaymentResult,
  RaastPaymentRequest,
} from './types'
