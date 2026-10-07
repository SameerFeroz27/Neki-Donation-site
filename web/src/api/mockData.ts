/* =========================================================
   DEVELOPMENT FIXTURES — NOT USER DATA.

   These exist so the grid and the hero can be designed and reviewed without a
   live API. They are loaded only when VITE_USE_MOCK_API=true (see
   .env.example) and the import is dynamic, so a normal build never downloads
   them.

   Nothing here may be treated as a source of truth: the moment there is a
   live API to read from, these are dead weight and should be deleted. They
   are deliberately kept in the wire shape, so they travel through the same
   validation in api/mappers.ts as a real response — a fixture cannot behave
   differently from production data.
   ========================================================= */
import type { CampaignDto } from './types'

const DAY = 86_400_000
const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString()

export const MOCK_CAMPAIGNS: CampaignDto[] = [
  {
    id: 'heart-surgery-zainab',
    title: 'Heart surgery for Zainab, 6',
    summary:
      'A hole in the heart needs urgent repair. The surgery is booked; the family has covered the tests only.',
    category: 'health',
    raised: 620_000,
    goal: 850_000,
    endsAt: inDays(11),
    verified: true,
  },
  {
    id: 'ration-40-widows',
    title: '6 months of ration for 40 widows',
    summary:
      'Flour, rice, oil and lentils delivered monthly to households with no earning member.',
    category: 'food',
    raised: 184_000,
    goal: 480_000,
    endsAt: inDays(24),
    verified: true,
  },
  {
    id: 'hand-pump-gul-bela',
    title: 'Hand-pump for village Gul Bela',
    summary:
      '120 families walk 4 km for water. One pump ends it — and the contractor is already on site.',
    category: 'water',
    raised: 312_000,
    goal: 350_000,
    endsAt: inDays(6),
    verified: true,
  },
  {
    id: 'fees-25-students',
    title: 'Fees for 25 students this term',
    summary:
      'Children who dropped out after the flood are back in class — fees, uniform and books included.',
    category: 'education',
    raised: 96_000,
    goal: 400_000,
    endsAt: inDays(31),
    verified: true,
  },
  {
    id: 'icu-accident-victim',
    title: 'ICU stay for an accident victim',
    summary:
      'A rickshaw driver needs nine days of intensive care. Every day funded buys him time.',
    category: 'emergency',
    raised: 245_000,
    goal: 300_000,
    endsAt: inDays(4),
    verified: false,
  },
  {
    id: 'qurbani-100-families',
    title: 'Qurbani shares for 100 families',
    summary:
      'Fresh meat reaches families who eat it twice a year. Booked with a verified slaughterhouse.',
    category: 'seasonal',
    raised: 1_200_000,
    goal: 2_000_000,
    endsAt: inDays(47),
    verified: true,
  },
]

// No MOCK_STATS on purpose. Campaigns can be invented to design a card; a
// platform total is a factual claim about the organisation, and there is no
// honest number to put there. The hero tile stays empty until the API answers.
