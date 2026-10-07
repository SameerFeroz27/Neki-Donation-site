import { getCampaigns } from '../api/campaigns'
import { ApiError } from '../api/client'
import { CAMPAIGNS_SECTION } from '../content/site'
import type { Campaign } from '../domain/campaign'
import { useAsync } from '../hooks/useAsync'
import { CampaignCard } from './CampaignCard'
import { ErrorBoundary } from './ErrorBoundary'
import { StateBlock } from './StateBlock'

/**
 * Placeholder cards the same height as real ones, so the section does not
 * jump when the data lands.
 */
function CampaignGridSkeleton() {
  return (
    <>
      <p className="sr-only" role="status">
        Loading campaigns…
      </p>
      <ul className="campaigns" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <li className="campaign-item" key={index}>
            <div className="campaign">
              <div className="campaign-arch campaign-arch--skeleton" />
              <span className="skeleton-line skeleton-line--title" />
              <span className="skeleton-line" />
              <span className="skeleton-line skeleton-line--short" />
              <span className="skeleton-line skeleton-line--meta" />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export function CampaignsSection({
  onDonate,
}: {
  onDonate?: (campaign: Campaign) => void
}) {
  const { state, reload } = useAsync(getCampaigns, 'campaigns')

  return (
    <section className="section" id="campaigns">
      <div className="wrap">
        <div className="section-head">
          <h2>{CAMPAIGNS_SECTION.title}</h2>
          <p>{CAMPAIGNS_SECTION.subtitle}</p>
        </div>

        {/* A crash inside the grid must not take the heading with it. */}
        <ErrorBoundary title="We could not show the campaigns">
          {state.status === 'loading' && <CampaignGridSkeleton />}

          {state.status === 'error' && (
            <StateBlock
              tone="error"
              title="We could not load the campaigns"
              body={state.error.message}
              // A 4xx will not fix itself, so no retry button for those.
              action={
                state.error instanceof ApiError && state.error.isRetryable
                  ? { label: 'Try again', onClick: reload }
                  : undefined
              }
            />
          )}

          {state.status === 'ready' && state.data.length === 0 && (
            <StateBlock
              title="No campaigns are open right now"
              body="Every campaign is fully funded or closed. New ones appear here as our field team verifies them."
            />
          )}

          {state.status === 'ready' && state.data.length > 0 && (
            <ul className="campaigns">
              {state.data.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onDonate={onDonate}
                />
              ))}
            </ul>
          )}
        </ErrorBoundary>
      </div>
    </section>
  )
}
