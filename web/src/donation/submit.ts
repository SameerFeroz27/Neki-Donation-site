/* =========================================================
   Turning a filled-in form into a donation.

   The one place that knows how the flow's intent becomes a call to whoever
   takes the money, and how the answer becomes a receipt. Components never
   see a provider; the provider never sees the flow's state.
   ========================================================= */
import {
  describeRoute,
  type DonationRoute,
  type Frequency,
  type Receipt,
} from '../domain/donation'
import type { PaymentProvider } from '../payments'
import type { CardDraft, RaastMode } from './validation'

export type DonationIntent = {
  campaignId: string
  campaignTitle: string
  /** Charged to the donor, in PKR. */
  total: number
  /** Reaches the campaign, in PKR. */
  received: number
  frequency: Frequency
  /** Only collected on the card route. */
  donorEmail?: string
  route:
    | { kind: 'raast'; payerId: string; payerIdType: RaastMode }
    | { kind: 'card'; card: CardDraft }
}

export async function performDonation(
  intent: DonationIntent,
  provider: PaymentProvider,
  signal: AbortSignal,
): Promise<Receipt> {
  const base = {
    campaignId: intent.campaignId,
    amount: intent.total,
    received: intent.received,
    frequency: intent.frequency,
    donorEmail: intent.donorEmail,
  }

  let reference: string
  let route: DonationRoute

  if (intent.route.kind === 'raast') {
    const result = await provider.requestToPay(
      {
        ...base,
        payerId: intent.route.payerId,
        payerIdType: intent.route.payerIdType,
      },
      signal,
    )
    reference = result.reference
    route = { kind: 'raast', id: intent.route.payerId }
  } else {
    // Tokenize first, and send only the token onward: the card number and CVC
    // must never leave the browser for our own server.
    const token = await provider.tokenizeCard(intent.route.card, signal)
    const result = await provider.chargeCard(
      {
        ...base,
        token: token.token,
        cardholderName: intent.route.card.name,
        country: intent.route.card.country,
      },
      signal,
    )
    reference = result.reference
    route = { kind: 'card', brand: token.brand, last4: token.last4 }
  }

  return {
    id: reference,
    campaignTitle: intent.campaignTitle,
    total: intent.total,
    received: intent.received,
    frequency: intent.frequency,
    method: describeRoute(route),
    createdAt: new Date(),
  }
}
