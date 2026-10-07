/* =========================================================
   Donation amounts.

   The model: the platform takes no fee at all — the About copy promises
   "0% platform fee, the full amount reaches the campaign". The ~2% is what
   the payment provider keeps, and who absorbs it is the donor's choice:

     cover the fee  -> the donor pays gift + fee, the campaign receives gift
     decline it     -> the donor pays gift,          the campaign absorbs fee

   Which is what the checkbox claims to do. The prototype computed the
   net as gift / 1.02 while telling the donor they had "added" the fee on
   top, so a 1,000 gift showed the campaign receiving 980 — inconsistent
   with its own label. This module is the single place that arithmetic
   lives, so it cannot drift again.
   ========================================================= */
import type { Frequency } from '../domain/donation'

export const PAYMENT_CONFIG = {
  /** Quick-pick amounts, in whole rupees. */
  presets: [500, 1000, 2000, 5000],
  /** What the payment provider keeps. The platform's own fee is 0%. */
  processorFeePercent: 2,
  /**
   * The prototype treated recurring gifts as fee-free. That is a business
   * rule rather than a technical one, so it is a flag here instead of
   * hidden arithmetic — flip it and the maths follows.
   */
  feeAppliesToRecurring: false,
  /** Indicative only: lets international donors read the card step in USD. */
  usdRate: 278.5,
} as const

export type Pricing = {
  /** The gift the donor chose. */
  gift: number
  /** The provider's cut. Zero when no fee applies. */
  fee: number
  /** Charged to the donor. */
  total: number
  /** Reaches the campaign. */
  received: number
}

/**
 * Whether the provider's fee is in play for this kind of gift at all. When it
 * is not, the fee question is not asked and the checkbox is not shown —
 * rather than offering a choice that changes nothing.
 */
export function feeAppliesTo(frequency: Frequency): boolean {
  return frequency === 'once' || PAYMENT_CONFIG.feeAppliesToRecurring
}

export function priceOf(
  gift: number,
  frequency: Frequency,
  coverFee: boolean,
): Pricing {
  const feeApplies = feeAppliesTo(frequency)

  const fee = feeApplies
    ? Math.round((gift * PAYMENT_CONFIG.processorFeePercent) / 100)
    : 0

  return {
    gift,
    fee,
    total: feeApplies && coverFee ? gift + fee : gift,
    received: coverFee ? gift : gift - fee,
  }
}

/** Whole USD, for display only — the charge is always settled in PKR. */
export function toUsd(amount: number): number {
  return amount / PAYMENT_CONFIG.usdRate
}
