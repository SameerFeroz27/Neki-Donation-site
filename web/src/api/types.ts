/* =========================================================
   Wire types — the JSON the API returns.

   These are intentionally separate from the domain model in src/domain.
   Treat every field as untrusted and let api/mappers.ts validate it at the
   boundary, so a malformed or renamed field degrades one card instead of
   crashing the page.

   Nothing here is imported by a component.
   ========================================================= */

export type CampaignDto = {
  id?: unknown
  title?: unknown
  summary?: unknown
  category?: unknown
  raised?: unknown
  goal?: unknown
  /** ISO 8601 date-time, e.g. "2026-11-30T23:59:59Z". */
  endsAt?: unknown
  verified?: unknown
}

/**
 * The list endpoint may return a bare array or an envelope. The envelope is
 * preferred because pagination metadata can be added later without breaking
 * clients, but both are handled — see toCampaignList.
 */
export type CampaignListDto = { items?: unknown }

export type PlatformStatsDto = {
  campaignsFunded?: unknown
  totalRaised?: unknown
  averagePayoutHours?: unknown
}
