import {
  CATEGORY_LABELS,
  CLOSING_SOON_DAYS,
  daysRemaining,
  progressOf,
  type Campaign,
} from '../domain/campaign'
import { formatMoney } from '../lib/format'
import { Icon } from './Icon'
import type { CSSProperties } from 'react'

function closingLabel(days: number | null): string | null {
  if (days === null) return null
  if (days === 0) return 'Closes today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

/**
 * The progress bar grows from zero on mount with no JavaScript: the CSS
 * animation's `from` is 0 and its `to` is the element's own width, which is
 * set through the --pct custom property. A two-pass React render would
 * achieve the same thing at the cost of an extra render per card.
 */
type BarStyle = CSSProperties & { '--pct': string }

export function CampaignCard({
  campaign,
  onDonate,
}: {
  campaign: Campaign
  onDonate?: (campaign: Campaign) => void
}) {
  const { percent, remaining, funded } = progressOf(campaign)
  const days = daysRemaining(campaign)
  const closing = closingLabel(days)
  const closingSoon = days !== null && days <= CLOSING_SOON_DAYS

  return (
    <li className="campaign-item">
      <article className="campaign">
        <div className="campaign-arch">
          <span className="arch-medal">
            <Icon name={campaign.category} />
            {campaign.verified && (
              <span className="campaign-verified">
                <Icon name="check" className="ico--sm" />
                <span className="sr-only">Verified by our field team</span>
              </span>
            )}
          </span>
          <span className="campaign-tag">
            {CATEGORY_LABELS[campaign.category]}
          </span>
        </div>

        <h3>{campaign.title}</h3>
        {campaign.summary !== '' && <p className="desc">{campaign.summary}</p>}

        <div className="meta">
          <span>
            Raised <b>{formatMoney(campaign.raised)}</b>
          </span>
          <span>{percent}%</span>
        </div>

        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent}% funded`}
          aria-label={`${campaign.title}: ${formatMoney(campaign.raised)} raised of ${formatMoney(campaign.goal)}, ${formatMoney(remaining)} to go`}
        >
          <i style={{ '--pct': `${percent}%` } as BarStyle} />
        </div>

        <div className="meta">
          <span>Goal {formatMoney(campaign.goal)}</span>
          {closing !== null && (
            <span className={closingSoon ? 'closing-soon' : undefined}>
              {closing}
            </span>
          )}
        </div>

        {funded && (
          <p className="campaign-funded">
            <Icon name="check" className="ico--sm" />
            Fully funded — further gifts go to the next campaign.
          </p>
        )}

        {/* Rendered only once a handler exists, so the grid never shows a
            button that does nothing. The donation flow arrives in Phase 4 and
            supplies it. */}
        {onDonate !== undefined && (
          <button
            className="btn btn--primary btn--block"
            type="button"
            onClick={() => onDonate(campaign)}
          >
            <Icon name="heart" />
            {funded ? 'Give anyway' : 'Donate Now'}
          </button>
        )}
      </article>
    </li>
  )
}
