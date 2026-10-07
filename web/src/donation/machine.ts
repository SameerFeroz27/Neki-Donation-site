/* =========================================================
   Donation flow state machine.

   A pure reducer, no React and no DOM. Every rule about what the flow allows
   — which step follows which, what makes an input acceptable, what a submit
   carries — is decided here. Components only dispatch and render.

   The prototype kept the same flow in a mutable `state` object mutated from
   delegated click handlers, which made "what can happen next" impossible to
   see. Here every transition is a case below.
   ========================================================= */
import type { Campaign } from '../domain/campaign'
import type { Frequency, Receipt } from '../domain/donation'
import { PAYMENT_CONFIG, priceOf, type Pricing } from './pricing'
import type { DonationIntent } from './submit'
import {
  cardBrand,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  formatRaastId,
  validateCard,
  validateRaastId,
  type CardDraft,
  type RaastMode,
  type ValidationError,
} from './validation'

export type Step = 'amount' | 'method' | 'raast' | 'card' | 'done'
export type Currency = 'PKR' | 'USD'
export type SubmitStatus = 'idle' | 'submitting' | 'failed'

export const STEP_TITLES: Record<Step, string> = {
  amount: 'Make a donation',
  method: 'Choose payment method',
  raast: 'Raast payment details',
  card: 'Card payment',
  done: 'Donation complete',
}

export type DonationState = {
  campaign: Campaign
  step: Step
  frequency: Frequency
  /**
   * Digits only, so an empty field is representable while the donor edits.
   * Formatting for display happens at render.
   */
  amountText: string
  coverFee: boolean
  currency: Currency
  raastMode: RaastMode
  raastId: string
  card: CardDraft
  status: SubmitStatus
  error: ValidationError | null
  /** Set when a submit starts; the provider effect consumes it. */
  intent: DonationIntent | null
  receipt: Receipt | null
}

export type DonationAction =
  | { type: 'frequency'; value: Frequency }
  | { type: 'amountText'; value: string }
  | { type: 'normaliseAmount' }
  | { type: 'coverFee'; value: boolean }
  | { type: 'currency'; value: Currency }
  | { type: 'raastMode'; value: RaastMode }
  | { type: 'raastId'; value: string }
  | { type: 'cardField'; field: keyof CardDraft; value: string }
  | { type: 'goTo'; step: Step }
  | { type: 'submit' }
  | { type: 'submitted'; receipt: Receipt }
  | { type: 'failed'; message: string }

const DEFAULT_AMOUNT = PAYMENT_CONFIG.presets[1]
const DEFAULT_COUNTRY = 'Pakistan'

export function createInitialState(campaign: Campaign): DonationState {
  return {
    campaign,
    step: 'amount',
    frequency: 'once',
    amountText: String(DEFAULT_AMOUNT),
    coverFee: true,
    currency: 'PKR',
    raastMode: 'mobile',
    raastId: '',
    card: {
      email: '',
      number: '',
      expiry: '',
      cvc: '',
      name: '',
      country: DEFAULT_COUNTRY,
    },
    status: 'idle',
    error: null,
    intent: null,
    receipt: null,
  }
}

/* ---------- selectors ---------- */

export function amountOf(state: DonationState): number {
  return Number(state.amountText) || 0
}

export function pricingOf(state: DonationState): Pricing {
  return priceOf(amountOf(state), state.frequency, state.coverFee)
}

function buildIntent(state: DonationState): DonationIntent | null {
  const pricing = pricingOf(state)
  const base = {
    campaignId: state.campaign.id,
    campaignTitle: state.campaign.title,
    total: pricing.total,
    received: pricing.received,
    frequency: state.frequency,
  }

  if (state.step === 'card') {
    return {
      ...base,
      // The draft travels with the intent because tokenization happens later,
      // inside the provider. The brand and last four digits on the receipt
      // come back from the token, not from here.
      route: { kind: 'card', card: state.card },
      donorEmail: state.card.email.trim(),
    }
  }

  if (state.step === 'raast') {
    return {
      ...base,
      route: {
        kind: 'raast',
        payerId: state.raastId,
        payerIdType: state.raastMode,
      },
    }
  }

  // The amount and method steps are not places a donation can be taken from.
  return null
}

/** Validation for the step the donor is trying to submit. */
function validateStep(state: DonationState): ValidationError | null {
  if (state.step === 'raast') {
    const message = validateRaastId(state.raastId, state.raastMode)
    return message === null ? null : { message, fields: ['raastId'] }
  }

  if (state.step === 'card') return validateCard(state.card, new Date())

  return null
}

/* ---------- reducer ---------- */

export function donationReducer(
  state: DonationState,
  action: DonationAction,
): DonationState {
  switch (action.type) {
    case 'frequency':
      return { ...state, frequency: action.value }

    case 'amountText': {
      // Digits only, no leading zeros, so display formatting is a pure
      // function of state.
      const digits = action.value
        .replace(/\D/g, '')
        .replace(/^0+/, '')
        .slice(0, 9)
      return { ...state, amountText: digits, error: null }
    }

    case 'normaliseAmount': {
      // Leaving the field empty should not leave the form unusable.
      if (amountOf(state) >= 1) return state
      return { ...state, amountText: String(PAYMENT_CONFIG.presets[0]) }
    }

    case 'coverFee':
      return { ...state, coverFee: action.value }

    case 'currency':
      return { ...state, currency: action.value }

    case 'raastMode':
      // The two formats are not interchangeable, so the field is cleared.
      return { ...state, raastMode: action.value, raastId: '', error: null }

    case 'raastId':
      return {
        ...state,
        raastId: formatRaastId(action.value, state.raastMode),
        error: null,
      }

    case 'cardField': {
      const { field, value } = action

      if (field === 'number') {
        const number = formatCardNumber(value)
        const brand = cardBrand(number.replace(/\D/g, ''))
        return {
          ...state,
          card: {
            ...state.card,
            number,
            // The expected code length belongs to the brand, so changing the
            // number can invalidate a code that was already typed.
            cvc: formatCvc(state.card.cvc, brand),
          },
          error: null,
        }
      }

      if (field === 'expiry') {
        return {
          ...state,
          card: { ...state.card, expiry: formatExpiry(value) },
          error: null,
        }
      }

      if (field === 'cvc') {
        const brand = cardBrand(state.card.number.replace(/\D/g, ''))
        return {
          ...state,
          card: { ...state.card, cvc: formatCvc(value, brand) },
          error: null,
        }
      }

      return {
        ...state,
        card: { ...state.card, [field]: value },
        error: null,
      }
    }

    case 'goTo': {
      // A guard rather than a rule: the Continue button is already disabled
      // without an amount, this just makes the reducer safe on its own.
      if (action.step === 'method' && amountOf(state) < 1) return state
      return { ...state, step: action.step, error: null }
    }

    case 'submit': {
      const error = validateStep(state)
      if (error !== null) return { ...state, error }

      const intent = buildIntent(state)
      if (intent === null) return state

      return { ...state, error: null, status: 'submitting', intent }
    }

    case 'submitted':
      return {
        ...state,
        status: 'idle',
        intent: null,
        error: null,
        receipt: action.receipt,
        step: 'done',
      }

    case 'failed':
      return {
        ...state,
        status: 'failed',
        intent: null,
        error: { message: action.message, fields: [] },
      }

    default:
      return state
  }
}
