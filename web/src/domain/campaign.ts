/* =========================================================
   Campaign domain model.

   This is the shape the UI works with, deliberately not the shape the API
   sends. api/mappers.ts translates at the boundary, so a change in the wire
   format never reaches a component.
   ========================================================= */

/**
 * The categories the platform supports. These strings are also icon names,
 * so <Icon name={campaign.category} /> type-checks with no lookup table —
 * and renaming one on either side becomes a compile error.
 */
export const CAMPAIGN_CATEGORIES = [
  'health',
  'food',
  'water',
  'education',
  'emergency',
  'seasonal',
  'other',
] as const

export type CampaignCategory = (typeof CAMPAIGN_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<CampaignCategory, string> = {
  health: 'Health',
  food: 'Food',
  water: 'Water',
  education: 'Education',
  emergency: 'Emergency',
  seasonal: 'Seasonal',
  other: 'Other',
}

export type Campaign = {
  id: string
  title: string
  summary: string
  category: CampaignCategory
  /** Whole rupees, exactly as the API reports them. */
  raised: number
  goal: number
  /** null when the campaign has no closing date. */
  endsAt: Date | null
  verified: boolean
}

export type CampaignProgress = {
  /** 0–100 and clamped: an over-funded campaign still reads as 100%. */
  percent: number
  /** Rupees still needed. Never negative. */
  remaining: number
  funded: boolean
}

export function progressOf(campaign: Campaign): CampaignProgress {
  const { raised, goal } = campaign

  // A goal of zero would divide by zero; treat anything already raised as
  // having met it rather than reporting a nonsensical figure.
  if (goal <= 0) {
    return { percent: raised > 0 ? 100 : 0, remaining: 0, funded: raised > 0 }
  }

  const percent = Math.min(100, Math.max(0, Math.round((raised / goal) * 100)))
  return {
    percent,
    remaining: Math.max(0, goal - raised),
    funded: raised >= goal,
  }
}

/**
 * Day-granularity, so one timestamp per page load is accurate enough — and
 * reading it at module scope keeps render pure, which reading the clock
 * inside a component would not be.
 */
const PAGE_LOADED_AT = new Date()

const DAY_MS = 86_400_000

/** Midnight local time, which is the unit people actually count days in. */
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * Whole days until the campaign closes, or null when it has no end date.
 *
 * Counted in calendar days, not elapsed hours: a deadline of 23:59 six days
 * from now is "6 days left", where dividing the raw millisecond difference
 * would report 7. Rounding also absorbs the 23- and 25-hour days at a
 * daylight-saving boundary.
 */
export function daysRemaining(
  campaign: Campaign,
  now: Date = PAGE_LOADED_AT,
): number | null {
  if (!campaign.endsAt) return null
  const days = Math.round(
    (startOfDay(campaign.endsAt) - startOfDay(now)) / DAY_MS,
  )
  return Math.max(0, days)
}

/** Within this many days, the closing date is worth calling out. */
export const CLOSING_SOON_DAYS = 7
