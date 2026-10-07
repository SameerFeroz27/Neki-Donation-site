import { PLATFORM } from '../content/site'

const numberFormat = new Intl.NumberFormat(PLATFORM.locale)

const LAKH = 100_000
const CRORE = 10_000_000

/** 620000 -> "PKR 620,000" */
export function formatMoney(amount: number): string {
  return `${PLATFORM.currency} ${numberFormat.format(Math.round(amount))}`
}

/** 1284 -> "1,284" */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/** One decimal place, but never a pointless ".0". */
function shortScale(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '')
}

/**
 * Large figures in the short form people here actually read:
 * 48,000,000 -> "PKR 4.8 Cr", 620,000 -> "PKR 6.2 Lac".
 *
 * For aggregates and counters, where the exact rupee is noise and the length
 * is the problem — "PKR 48,000,000" wraps onto two lines in a stat tile and
 * knocks its label out of line with its neighbours. Individual campaign
 * amounts use formatMoney, because there the exact figure is the point.
 * Below a lakh there is nothing to shorten, so it falls through.
 */
export function formatMoneyCompact(amount: number): string {
  if (amount >= CRORE) {
    return `${PLATFORM.currency} ${shortScale(amount / CRORE)} Cr`
  }
  if (amount >= LAKH) {
    return `${PLATFORM.currency} ${shortScale(amount / LAKH)} Lac`
  }
  return formatMoney(amount)
}
