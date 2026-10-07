/* =========================================================
   Which provider the app talks to.

   One decision, made once per page load, in one place. Components never see
   this — they call donation/submit.ts, which asks for the provider.
   ========================================================= */
import { createHttpPaymentProvider } from './http'
import { createSimulatedPaymentProvider } from './simulated'
import type { PaymentProvider } from './types'

let instance: PaymentProvider | null = null

export function paymentProvider(): PaymentProvider {
  if (instance === null) {
    instance =
      import.meta.env.VITE_USE_MOCK_API === 'true'
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
