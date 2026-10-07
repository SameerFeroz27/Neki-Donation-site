import { getPlatformStats } from '../api/campaigns'
import { BRAND, HERO, HERO_LEDE } from '../content/site'
import { useAsync } from '../hooks/useAsync'
import { Logo } from './Logo'
import { PlatformStats } from './PlatformStats'

export function Hero() {
  const { state } = useAsync(getPlatformStats, 'platform-stats')

  // A failed totals request is not surfaced: the hero is complete without
  // them, and an error banner over the lede would be noise. The grid below
  // already reports a real connectivity problem.
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <p className="eyebrow">
          <Logo className="logo--tiny" />
          {HERO.eyebrow}
        </p>

        <h1 className="app-name">{BRAND.name}</h1>
        <p className="tagline">{BRAND.tagline}</p>

        <p className="lede">
          {HERO_LEDE.map((part, index) =>
            'emphasis' in part && part.emphasis ? (
              <strong key={index}>{part.text}</strong>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </p>

        <PlatformStats stats={state.status === 'ready' ? state.data : null} />
      </div>
    </section>
  )
}
