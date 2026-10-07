/**
 * Vocabulary shared by the donation flow and its receipt.
 *
 * Kept in the domain rather than in the flow module because a receipt
 * outlives the dialog that produced it — it is what we would hand to the
 * backend, an email, or a history page later.
 */

export type Frequency = 'once' | 'monthly'

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: 'One-time',
  monthly: 'Monthly',
}

/** Which route the donor took, and enough to describe it back to them. */
export type DonationRoute =
  { kind: 'raast'; id: string } | { kind: 'card'; brand: string; last4: string }

export type Receipt = {
  /** Provider reference. Until Phase 5 this is generated locally. */
  id: string
  campaignTitle: string
  /** Charged to the donor, in PKR, including any processor fee. */
  total: number
  /** Reaches the campaign, in PKR. */
  received: number
  frequency: Frequency
  /** Human-readable, e.g. "Visa ···· 4242". */
  method: string
  createdAt: Date
}

/** How the route reads on a receipt. */
export function describeRoute(route: DonationRoute): string {
  return route.kind === 'raast'
    ? `Raast Request to Pay · ${route.id}`
    : `${route.brand.charAt(0)}${route.brand.slice(1).toLowerCase()} ···· ${route.last4}`
}
