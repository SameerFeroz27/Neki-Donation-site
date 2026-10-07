/* =========================================================
   The payment interface.

   The seam between this frontend and whoever takes the money. Two
   implementations exist — one that calls the API, and a development
   simulator — and nothing in the UI knows which is in play.

   Two rules the interface exists to enforce:

   1. Raw card details never leave the browser for our own server. They are
      turned into a single-use token (in production by the provider's hosted
      fields or SDK), and only the token is sent onward. That is why
      tokenizeCard is part of this interface rather than something the form
      does quietly.

   2. A donation is one call per route. requestToPay returns a reference the
      donor still has to approve in their bank app; chargeCard returns a
      settled payment.
   ========================================================= */
import type { Frequency } from '../domain/donation'
import type { CardBrand, CardDraft } from '../donation/validation'

/** Everything both routes need. Amounts are whole rupees. */
export type DonationRequest = {
  campaignId: string
  /** Charged to the donor, including any processor fee. */
  amount: number
  /** Reaches the campaign. */
  received: number
  frequency: Frequency
  /** Only collected on the card route. */
  donorEmail?: string
}

export type RaastPaymentRequest = DonationRequest & {
  /** The donor's Raast Mobile ID or IBAN. */
  payerId: string
  payerIdType: 'mobile' | 'iban'
}

export type CardToken = {
  /** Single-use token from the provider. Never a card number. */
  token: string
  brand: CardBrand
  last4: string
}

export type CardPaymentRequest = DonationRequest & {
  token: string
  cardholderName: string
  country: string
}

export type PaymentResult = {
  /** Provider reference, shown on the receipt. */
  reference: string
  /** 'pending' means the donor still has to approve it in their bank app. */
  status: 'pending' | 'succeeded'
}

export interface PaymentProvider {
  /**
   * Exchanges entered card details for a single-use token.
   *
   * In production this is the provider's hosted field or SDK, so the card
   * number and CVC are typed into the provider's frame and never touch this
   * application or our server.
   */
  tokenizeCard(card: CardDraft, signal: AbortSignal): Promise<CardToken>

  /** Raises a Raast request-to-pay for the donor to approve. */
  requestToPay(
    request: RaastPaymentRequest,
    signal: AbortSignal,
  ): Promise<PaymentResult>

  /** Charges a tokenized card. */
  chargeCard(
    request: CardPaymentRequest,
    signal: AbortSignal,
  ): Promise<PaymentResult>
}
