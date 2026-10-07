/**
 * Platform totals for the hero.
 *
 * Every field is optional on purpose: the endpoint can publish one figure at
 * a time, and a field that is absent must not be rendered as a zero. There is
 * no default value here — the UI shows nothing rather than a guess.
 */
export type PlatformStats = {
  campaignsFunded?: number
  totalRaised?: number
  averagePayoutHours?: number
}
