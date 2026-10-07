/* =========================================================
   Boundary mappers: untrusted JSON -> domain model.

   Every rule about what makes a campaign renderable lives here. A record
   that cannot be honestly displayed is dropped rather than defaulted into
   something misleading, so one bad row costs one card, not the grid.
   ========================================================= */
import {
  CAMPAIGN_CATEGORIES,
  type Campaign,
  type CampaignCategory,
} from '../domain/campaign'
import type { PlatformStats } from '../domain/stats'
import type { CampaignDto, CampaignListDto, PlatformStatsDto } from './types'

const KNOWN_CATEGORIES = new Set<string>(CAMPAIGN_CATEGORIES)

function asText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** Accepts a number or a numeric string; rejects NaN, Infinity and negatives. */
function asAmount(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value
  if (typeof parsed !== 'number' || !Number.isFinite(parsed) || parsed < 0) {
    return null
  }
  return Math.round(parsed)
}

/** An unrecognised category is shown as "Other" instead of being dropped. */
function asCategory(value: unknown): CampaignCategory {
  const name = asText(value)?.toLowerCase()
  return name && KNOWN_CATEGORIES.has(name)
    ? (name as CampaignCategory)
    : 'other'
}

function asDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Returns null when the record lacks anything the UI needs — without a
 * stable id, a title and a goal there is no card to draw.
 */
export function toCampaign(input: unknown): Campaign | null {
  if (typeof input !== 'object' || input === null) return null
  const dto = input as CampaignDto

  const id = asText(dto.id)
  const title = asText(dto.title)
  const goal = asAmount(dto.goal)
  const raised = asAmount(dto.raised)

  if (!id || !title || goal === null || raised === null) return null

  return {
    id,
    title,
    summary: asText(dto.summary) ?? '',
    category: asCategory(dto.category),
    raised,
    goal,
    endsAt: asDate(dto.endsAt),
    verified: dto.verified === true,
  }
}

/** Accepts a bare array or an { items: [...] } envelope. */
export function toCampaignList(payload: unknown): Campaign[] {
  let items: unknown[] = []

  if (Array.isArray(payload)) {
    items = payload
  } else if (typeof payload === 'object' && payload !== null) {
    const { items: nested } = payload as CampaignListDto
    if (Array.isArray(nested)) items = nested
  }

  return items
    .map(toCampaign)
    .filter((campaign): campaign is Campaign => campaign !== null)
}

/**
 * Totals are all-or-nothing per field: a field that is missing or unusable is
 * left out so the hero can never print a stand-in figure.
 */
export function toPlatformStats(payload: unknown): PlatformStats | null {
  if (typeof payload !== 'object' || payload === null) return null
  const dto = payload as PlatformStatsDto

  const stats: PlatformStats = {}
  const campaignsFunded = asAmount(dto.campaignsFunded)
  const totalRaised = asAmount(dto.totalRaised)
  const averagePayoutHours = asAmount(dto.averagePayoutHours)

  if (campaignsFunded !== null) stats.campaignsFunded = campaignsFunded
  if (totalRaised !== null) stats.totalRaised = totalRaised
  if (averagePayoutHours !== null) stats.averagePayoutHours = averagePayoutHours

  return Object.keys(stats).length > 0 ? stats : null
}
