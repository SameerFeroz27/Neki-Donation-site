import type { PlatformStats as PlatformStatsData } from '../domain/stats'
import { formatMoneyCompact, formatNumber } from '../lib/format'
import { Icon, type IconName } from './Icon'

/**
 * What a figure looks like when it is not known yet.
 *
 * A dash, never a zero: zero is a claim, and there is no claim to make. The
 * cards therefore keep their finished shape from the first paint, so nothing
 * reflows when live data arrives and no reader can mistake a placeholder for a
 * real total.
 */
const PENDING = '—'

type Row = {
  key: string
  label: string
  icon: IconName
  /** The one card that carries the strongest emphasis. */
  featured?: boolean
  /** null when the API has not supplied that figure. */
  read: (stats: PlatformStatsData) => string | null
}

const ROWS: Row[] = [
  {
    key: 'campaignsFunded',
    label: 'Campaigns funded',
    // A plain heart, not the hand-heart the design sketched: at 23px the hand
    // was unreadable and the pair read as a face. Legibility wins.
    icon: 'heart',
    read: (stats) =>
      stats.campaignsFunded === undefined
        ? null
        : formatNumber(stats.campaignsFunded),
  },
  {
    key: 'totalRaised',
    label: 'Raised so far',
    icon: 'banknote',
    featured: true,
    read: (stats) =>
      stats.totalRaised === undefined
        ? null
        : formatMoneyCompact(stats.totalRaised),
  },
  {
    key: 'averagePayoutHours',
    label: 'Average payout',
    icon: 'clock',
    read: (stats) =>
      stats.averagePayoutHours === undefined
        ? null
        : `${formatNumber(stats.averagePayoutHours)} hrs`,
  },
]

/**
 * Presentational only — it renders the totals it is handed and nothing more.
 *
 * Every card is always rendered, so a figure the API has not supplied yet
 * shows its label over a dash rather than vanishing and leaving a gap. The
 * middle card is highlighted because this is the first thing a visitor sees.
 */
export function PlatformStats({ stats }: { stats: PlatformStatsData | null }) {
  const values = ROWS.map((row) => (stats === null ? null : row.read(stats)))
  const allPending = values.every((value) => value === null)

  return (
    <section className="stat-tile" aria-label="Platform totals">
      {/* One announcement instead of a dash read out three times. */}
      {allPending && (
        <p className="sr-only" role="status">
          Platform totals are not available yet.
        </p>
      )}

      {ROWS.map((row, index) => {
        const value = values[index]
        return (
          <div
            className={row.featured ? 'stat-card is-featured' : 'stat-card'}
            key={row.key}
          >
            <span className="stat-badge" aria-hidden="true">
              <Icon name={row.icon} />
            </span>
            {value === null ? (
              <b className="stat-value is-pending" aria-hidden="true">
                {PENDING}
              </b>
            ) : (
              <b className="stat-value">{value}</b>
            )}
            <span className="stat-label">{row.label}</span>
          </div>
        )
      })}
    </section>
  )
}
