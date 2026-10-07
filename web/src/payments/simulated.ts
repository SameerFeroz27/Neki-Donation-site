/* =========================================================
   Development simulator.

   Stands in for the provider until the backend exists. Enabled only by
   VITE_USE_MOCK_API=true — see .env.example — so it can never be reached by
   a real deployment. No money moves and no card is ever charged.

   It deliberately mirrors the real provider's shapes, including the
   tokenization step, so the app cannot be written in a way that only works
   against the simulator.
   ========================================================= */
import type { CardBrand } from '../donation/validation'
import type {
  CardPaymentRequest,
  CardToken,
  PaymentProvider,
  PaymentResult,
  RaastPaymentRequest,
} from './types'

/** Long enough to exercise the submitting state honestly. */
const SETTLE_MS = 900

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function reference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-8)}`
}

export function createSimulatedPaymentProvider(): PaymentProvider {
  return {
    async tokenizeCard(card, signal): Promise<CardToken> {
      await delay(200, signal)
      const digits = card.number.replace(/\D/g, '')
      const brand: CardBrand = digits.startsWith('4')
        ? 'VISA'
        : digits.startsWith('5')
          ? 'MASTERCARD'
          : digits.startsWith('3')
            ? 'AMEX'
            : 'VISA'
      // Shaped like a real token, but obviously not one.
      return {
        token: `sim_tok_${digits.slice(-4)}`,
        brand,
        last4: digits.slice(-4),
      }
    },

    async requestToPay(
      _request: RaastPaymentRequest,
      signal,
    ): Promise<PaymentResult> {
      await delay(SETTLE_MS, signal)
      // Nothing is charged until the donor approves it in their bank app.
      return { reference: reference('NK'), status: 'pending' }
    },

    async chargeCard(
      _request: CardPaymentRequest,
      signal,
    ): Promise<PaymentResult> {
      await delay(SETTLE_MS, signal)
      return { reference: reference('NK'), status: 'succeeded' }
    },
  }
}
