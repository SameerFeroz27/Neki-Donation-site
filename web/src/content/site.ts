/* =========================================================
   Site content
   Everything a copywriter or PM touches lives here, so the shell
   components carry no hard-coded marketing text and a rebrand is a
   one-file change.
   ========================================================= */

export const BRAND = {
  name: 'Neki',
  tagline: 'Give with trust.',
} as const

/** Platform-level settings that are not payment-specific. */
export const PLATFORM = {
  currency: 'PKR',
  locale: 'en-PK',
} as const

export const NAV = [
  { label: 'Campaigns', href: '#campaigns' },
  { label: 'About', href: '#about' },
] as const

export const HERO = {
  eyebrow: 'Verified campaigns · Zakat & Sadaqah eligible',
} as const

/**
 * The hero paragraph, split so emphasised phrases stay data rather than
 * markup. `emphasis` maps to <strong>.
 */
export const HERO_LEDE = [
  {
    text: "Neki is a donation platform for real, verified campaigns — a widow's monthly ration, a child's surgery, a village hand-pump, a student's fees. Pick a campaign, choose your amount, and pay the way you already pay: ",
  },
  { text: 'Request to Pay', emphasis: true },
  { text: ' through Raast, or ' },
  { text: 'credit / debit card', emphasis: true },
  {
    text: '. Every rupee is tracked, and each campaign shows you exactly what it still needs.',
  },
] as const satisfies readonly { text: string; emphasis?: boolean }[]

export const CAMPAIGNS_SECTION = {
  title: 'Campaigns you can support',
  subtitle:
    'Each campaign is verified by our field team. Give once, or set up a monthly gift.',
} as const

export const ABOUT = {
  title: 'About Neki',
  body: 'Donations are held in a dedicated account and released to each campaign in stages, against bills and photos. Our platform fee is 0% — the full amount reaches the campaign. Card details never touch our servers; they are handled by our PCI-DSS compliant payment provider.',
} as const
