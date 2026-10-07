/* =========================================================
   The live provider: our API, with the payment provider behind it.

   This is where the frontend actually talks to the API. What the API expects
   and returns is its business, not this repository's — the paths below are
   simply the ones this app currently calls, and the shapes it sends are
   defined by the request types in ./types.ts.
   ========================================================= */
import { ApiError, apiPost } from '../api/client'
import type {
  CardPaymentRequest,
  CardToken,
  PaymentProvider,
  PaymentResult,
  RaastPaymentRequest,
} from './types'

type DonationResponse = { reference?: unknown }

function toResult(
  payload: DonationResponse,
  status: PaymentResult['status'],
): PaymentResult {
  const { reference } = payload
  if (typeof reference !== 'string' || reference === '') {
    throw new ApiError('The server did not return a payment reference.')
  }
  return { reference, status }
}

export function createHttpPaymentProvider(): PaymentProvider {
  return {
    tokenizeCard(): Promise<CardToken> {
      // Deliberately not implemented as an HTTP call. Sending a card number or
      // CVC to our own server would put this app in PCI scope, which is the
      // one thing the whole interface exists to avoid.
      //
      // Production: replace this with the provider's hosted field or SDK.
      // Until then, card payments need the simulator, or a real tokenizer.
      return Promise.reject(
        new ApiError(
          'Card payments are not configured yet. Wire the provider SDK into tokenizeCard, or run with VITE_USE_MOCK_API=true to use the simulator.',
        ),
      )
    },

    async requestToPay(
      request: RaastPaymentRequest,
      signal,
    ): Promise<PaymentResult> {
      const payload = await apiPost<DonationResponse>(
        '/api/donations/raast',
        request,
        signal,
      )
      // A request-to-pay is not money yet; the donor approves it in their app.
      return toResult(payload, 'pending')
    },

    async chargeCard(
      request: CardPaymentRequest,
      signal,
    ): Promise<PaymentResult> {
      const payload = await apiPost<DonationResponse>(
        '/api/donations/card',
        request,
        signal,
      )
      return toResult(payload, 'succeeded')
    },
  }
}
