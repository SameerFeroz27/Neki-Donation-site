import { useState } from 'react'
import { AboutSection } from './components/AboutSection'
import { CampaignsSection } from './components/CampaignsSection'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { IconSprite } from './components/Icon'
import { DonationDialog } from './components/donation/DonationDialog'
import type { Campaign } from './domain/campaign'

export default function App() {
  /**
   * The campaign being donated to, or null. The dialog is mounted only while
   * there is one, which is what makes each donation start from a clean slate.
   */
  const [donating, setDonating] = useState<Campaign | null>(null)

  return (
    <div className="shell" id="top">
      <IconSprite />

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header />

      <main className="main" id="main">
        <Hero />
        <CampaignsSection onDonate={(campaign) => setDonating(campaign)} />
        <AboutSection />
      </main>

      <Footer />

      {donating !== null && (
        // Its own boundary: a problem in the flow must never take the page
        // down with it.
        <ErrorBoundary title="The donation form hit a problem">
          <DonationDialog
            campaign={donating}
            onClose={() => setDonating(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}
