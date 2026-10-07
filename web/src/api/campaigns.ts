/* =========================================================
   Data access.

   The only module a component imports to get campaign data. It hides the
   endpoint paths, the wire format and the fixtures switch, so swapping the
   API in is a change here and nowhere else.
   ========================================================= */
import type { Campaign } from '../domain/campaign'
import type { PlatformStats } from '../domain/stats'
import { apiGet } from './client'
import { toCampaignList, toPlatformStats } from './mappers'
import type { CampaignDto } from './types'

/** Opt-in development fixtures; off unless VITE_USE_MOCK_API=true. */
const USE_FIXTURES = import.meta.env.VITE_USE_MOCK_API === 'true'

/**
 * Imported dynamically so the fixtures become their own chunk — a normal
 * build never downloads them. A module-scope import would ship them to
 * everyone regardless of the flag.
 */
async function fixtureCampaigns(): Promise<CampaignDto[]> {
  const { MOCK_CAMPAIGNS } = await import('./mockData')
  return MOCK_CAMPAIGNS
}

/**
 * The campaign list. Either a bare array or an { items: [...] } envelope is
 * accepted, so the API can adopt an envelope later without a client change.
 */
export async function getCampaigns(signal?: AbortSignal): Promise<Campaign[]> {
  const payload = USE_FIXTURES
    ? await fixtureCampaigns()
    : await apiGet<unknown>('/api/campaigns', signal)

  return toCampaignList(payload)
}

/**
 * The platform totals for the hero.
 *
 * There are deliberately no fixture totals. A plausible-looking figure is
 * exactly the thing this app must not invent, so while the fixtures are on
 * the hero tile stays in its empty state — which is also the state a real
 * deployment starts in.
 */
export async function getPlatformStats(
  signal?: AbortSignal,
): Promise<PlatformStats | null> {
  if (USE_FIXTURES) return null

  return toPlatformStats(await apiGet<unknown>('/api/stats', signal))
}
