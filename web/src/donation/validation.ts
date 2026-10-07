/* =========================================================
   Donation input validation.

   Pure functions with no DOM access: the state machine calls them, so every
   rule lives in one place and a component only renders the message it is
   handed. Ported from the prototype, which had these rules inline in event
   handlers where they could not be reused or reasoned about.
   ========================================================= */

export type RaastMode = 'mobile' | 'iban'

type RaastRule = {
  placeholder: string
  maxLength: number
  inputMode: 'numeric' | 'text'
  hint: string
  pattern: RegExp
  invalid: string
}

export const RAAST_RULES: Record<RaastMode, RaastRule> = {
  mobile: {
    placeholder: '03xxxxxxxxx',
    maxLength: 11,
    inputMode: 'numeric',
    hint: '11 digits, starting with 03. We only use this to send the request.',
    // Raast Mobile ID: 03 followed by nine digits.
    pattern: /^03\d{9}$/,
    invalid: 'Enter a valid 11-digit Raast Mobile ID (03XXXXXXXXX).',
  },
  iban: {
    placeholder: 'PK00 XXXX 0000 0000 0000 0000',
    maxLength: 29,
    inputMode: 'text',
    hint: '24 characters, starting with PK. You will find it in your bank app.',
    // PK + 2 check digits + 4-letter bank code + 16 digits = 24 characters.
    pattern: /^PK\d{2}[A-Z]{4}\d{16}$/,
    invalid: 'Enter a valid 24-character IBAN starting with PK.',
  },
}

/** Keeps only what the chosen format allows; groups an IBAN in fours. */
export function formatRaastId(raw: string, mode: RaastMode): string {
  if (mode === 'mobile') return raw.replace(/\D/g, '').slice(0, 11)

  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .slice(0, 29)
}

export function validateRaastId(value: string, mode: RaastMode): string | null {
  const rule = RAAST_RULES[mode]
  return rule.pattern.test(value.replace(/\s/g, '')) ? null : rule.invalid
}

/* ---------- card ---------- */

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'UNIONPAY' | 'UNKNOWN'

export const BRAND_LABELS: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'Amex',
  UNIONPAY: 'UnionPay',
  UNKNOWN: 'Card',
}

export function cardBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD'
  if (/^3[47]/.test(digits)) return 'AMEX'
  if (/^62/.test(digits)) return 'UNIONPAY'
  return 'UNKNOWN'
}

const digitsFor = (brand: CardBrand) => (brand === 'AMEX' ? 15 : 16)

/** Amex prints a 4-digit code; everyone else uses 3. */
export function cvcLength(brand: CardBrand): number {
  return brand === 'AMEX' ? 4 : 3
}

/** Caps the code at what this brand actually prints. */
export function formatCvc(raw: string, brand: CardBrand): string {
  return raw.replace(/\D/g, '').slice(0, cvcLength(brand))
}

/** Groups 4-4-4-4, or 4-6-5 for Amex, and stops at the brand's length. */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const brand = cardBrand(digits)
  const capped = digits.slice(0, digitsFor(brand))

  if (brand === 'AMEX') {
    return [capped.slice(0, 4), capped.slice(4, 10), capped.slice(10, 15)]
      .filter((part) => part !== '')
      .join(' ')
  }

  return capped.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * "MM / YY" — the same rule the original prototype used: digits only, capped
 * at four, with the separator inserted once there are three.
 *
 * It deliberately does NOT guess a missing leading zero. Padding a leading
 * 2–9 looked helpful but rewrote what the donor typed — "2029" came out as
 * "02 / 02", because the first digit was taken as a one-digit month. Getting
 * the month in the right order and entering "09 / 29" is the donor's job; the
 * field's job is to never lie about what was entered.
 */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length >= 3
    ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
    : digits
}

export function luhnValid(digits: string): boolean {
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

export type CardField = 'email' | 'number' | 'expiry' | 'cvc' | 'name'

/** Every input the flow can mark as invalid. */
export type FormField = CardField | 'raastId'

export type ValidationError = {
  message: string
  /** Which inputs to mark, so the message and the highlighting cannot drift. */
  fields: readonly FormField[]
}

export type CardDraft = {
  email: string
  number: string
  expiry: string
  cvc: string
  name: string
  country: string
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i

export function validateCard(
  draft: CardDraft,
  now: Date,
): ValidationError | null {
  const digits = draft.number.replace(/\D/g, '')
  const brand = cardBrand(digits)
  const required = digitsFor(brand)
  const [monthText, yearText] = draft.expiry
    .split('/')
    .map((part) => part.trim())
  const month = Number(monthText)
  const year = Number(yearText)

  const fail = (message: string, ...fields: CardField[]): ValidationError => ({
    message,
    fields,
  })

  if (!EMAIL.test(draft.email.trim())) {
    return fail('Enter a valid email for your receipt.', 'email')
  }
  if (digits.length !== required) {
    return fail(`Card number must be ${required} digits.`, 'number')
  }
  if (!luhnValid(digits)) {
    return fail('That card number looks invalid.', 'number')
  }
  if (!monthText || !yearText || month < 1 || month > 12) {
    return fail('Enter the expiry as MM / YY.', 'expiry')
  }

  // Expiry is valid through the end of its month.
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return fail('This card has expired.', 'expiry')
  }

  const expectedCvc = cvcLength(brand)
  if (draft.cvc.length !== expectedCvc) {
    return fail(`CVC must be ${expectedCvc} digits.`, 'cvc')
  }
  if (draft.name.trim().length < 3) {
    return fail('Enter the full name printed on the card.', 'name')
  }

  return null
}
