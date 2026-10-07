# Neki — frontend

The Neki donation platform frontend: **React 19 + Vite + TypeScript**.

This repository is the frontend only. The API it talks to is built and owned
separately, so nothing here specifies it.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Dev server with HMR on port 5173 (`strictPort`)         |
| `npm run build`     | Typecheck, then production build into `dist/`           |
| `npm run preview`   | Serve the built `dist/` to check the real output        |
| `npm run typecheck` | `tsc -b` only                                           |
| `npm run lint`      | oxlint — add `lint:fix` to autofix                      |
| `npm run format`    | Prettier — add `format:check` to verify without writing |

`base` is `./`, so a `dist/` build can be opened straight from disk or dropped
into a subfolder for a demo. Dev requests to `/api` are proxied to
`http://localhost:8000`.

### Working without a live API

`src/api/mockData.ts` holds development fixtures, and they are **on unless
there is a reason for them to be off**:

| Configuration             | Result                         |
| ------------------------- | ------------------------------ |
| nothing set               | fixtures on                    |
| `VITE_USE_MOCK_API=true`  | fixtures on                    |
| `VITE_USE_MOCK_API=false` | fixtures off                   |
| `VITE_API_BASE_URL=…`     | fixtures off, API used instead |

The "nothing set" row is deliberate. There was a version where fixtures had to
be switched on explicitly, and a correctly-built deployment then showed an
empty campaign grid with no way to reach the donation flow at all — the
deployment looked broken because of a host setting nobody had made.

Setting `VITE_API_BASE_URL` turns them off on its own, so connecting the API
is the only change needed.

The rule is resolved once in `vite.config.ts` and injected as the
`__USING_FIXTURES__` literal. It lives there rather than in the source because
the bundler must see a constant to drop the fixture chunk; reading it inside a
module would ship 1.5 kB of fixture data to every build. Verified all three
ways: the default build emits a `mockData` chunk, and both the flag and the
API-URL builds emit none.

The fixtures are in the **wire** shape, so they go through the same validation
in `api/mappers.ts` as a real response — a fixture cannot behave differently
from production data. They cover campaigns only; there are no fixture totals,
so the hero tile stays in its empty state. While they are on, the campaign
section shows a "Sample campaigns" note, which disappears with them.

Delete `api/mockData.ts` and `payments/simulated.ts` once there is a live API.

### Deploying

The build is a static `dist/`, so any static host works. On Vercel, import the
`web/` directory as the project root; the framework preset and build command
are detected and **no environment variables or command overrides are needed**.
Because fixtures default on, a plain deployment already has campaigns and a
working donation flow.

For a real deployment, set `VITE_API_BASE_URL` to the API origin. To keep the
demo data but use an API for something else, set `VITE_USE_MOCK_API` explicitly
instead.

Vite inlines all of this at **build** time, so any change needs a redeploy.

> A fixture deployment shows sample campaigns on a public URL, with sample
> progress and a "verified" badge, and its checkout is simulated. Fine for a
> team demo and confusing to anyone else — the page says so, but treat a demo
> deployment as internal.

## Structure

```
src/
  content/site.ts        brand, nav, hero, section copy — all strings
  domain/
    campaign.ts          Campaign, categories, progress and days-left derivation
    stats.ts             PlatformStats — every field optional by design
  api/
    types.ts             wire shapes (the JSON the backend sends)
    mappers.ts           untrusted JSON -> domain, with validation
    client.ts            fetch wrapper: base URL, ApiError, abort
    campaigns.ts         the only module components import for data
    mockData.ts          development fixtures — off once an API is configured
  hooks/useAsync.ts      async state with abort and retry
  lib/format.ts          currency and number formatting
  components/
    Icon.tsx             the one icon sprite + <Icon name="…" />
    Logo.tsx             khatam (eight-point star) mark
    ErrorBoundary.tsx    stops one bad component blanking the page
    Header.tsx  Hero.tsx  CampaignsSection.tsx  AboutSection.tsx  Footer.tsx
    CampaignCard.tsx     one campaign, including its progress bar
    PlatformStats.tsx    hero totals; renders nothing without API data
    StateBlock.tsx       shared empty / error presentation
    donation/            the payment flow, one file per step
      DonationDialog.tsx   native <dialog>, panel switch, close handling
      PlanStrip.tsx        the running total shown above each step
      AmountStep.tsx  MethodStep.tsx  RaastStep.tsx  CardStep.tsx  DoneStep.tsx
  donation/
    machine.ts           the flow's state machine (pure reducer, no React)
    pricing.ts           who pays the processor fee
    validation.ts        Raast ID, card number, Luhn, expiry — pure
    submit.ts            intent -> provider call -> receipt
    context.ts  DonationProvider.tsx
  payments/              the seam the backend plugs into
    types.ts             the PaymentProvider interface and its request shapes
    http.ts              the real one: our API + the payment provider
    simulated.ts         development stand-in, used when no API is configured
    index.ts             picks one, once per page load
  styles/
    tokens.css           colour, shape, elevation, layout — the theming knob
    base.css             reset, document defaults, .wrap, focus, skip link
    icons.css  buttons.css  layout.css  feedback.css  campaigns.css
    donation.css         the dialog and its five steps
    index.css            import order = cascade order
```

## Conventions

**Tokens are the only place brand values live.** No component hard-codes a
green, a radius or a shadow; change `styles/tokens.css` and the whole app
follows. Only green and gold appear anywhere — that is a brand rule, not a
preference.

**Buttons are not pills.** Every control uses a 13px "arch" corner
(`--r-btn`). Size variants (`btn--sm`, `btn--lg`) only change that one value.
Variants are `btn--primary` (green, the default), `btn--gold` (the single most
important action on a screen), `btn--ghost` (secondary).

**Icons are one sprite.** Add a `<symbol id="i-name">` to `IconSprite`, add
`'name'` to `IconName`, then use `<Icon name="name" />`. Stroke and fill are
declared once in `styles/icons.css` and inherit through `<use>`, so a duotone
icon only overrides `fill`/`stroke` on its own paths. All icons are decorative
and `aria-hidden`; the label beside them carries the meaning.

**No invented numbers.** Nothing in this app displays a statistic that did not
come from the API. The hero totals are three cards — icon badge, figure, label
— with the middle one highlighted, since that row is the first thing a visitor
sees. They keep their finished shape before any data exists: a figure that has
not arrived shows its label over a dash, never a zero. Zero is a claim, and
there is no claim to make. The dash is `aria-hidden` and one live region
announces that totals are not available yet, so nothing reads the placeholder
out three times.

That is also why `api/mockData.ts` has campaigns but no `MOCK_STATS`. A
campaign can be invented to design a card; a platform total is a factual claim
about the organisation.

**Aggregates use the local short form.** `formatMoneyCompact` renders
48,000,000 as "PKR 4.8 Cr" and 620,000 as "PKR 6.2 Lac". Individual campaign
amounts keep the exact rupee through `formatMoney`, because there the precise
figure is the point — but a hero counter is read at a glance, and
"PKR 48,000,000" also wrapped onto two lines inside the tile and pushed its
label out of line with the others.

**Data never reaches a component unvalidated.** `api/mappers.ts` is the only
place that trusts nothing: it coerces amounts, rejects NaN and negatives,
parses dates, and drops a record it cannot honestly render — so one bad row
costs one card, not the grid. An unrecognised category becomes "Other" instead
of being dropped.

**The donation flow is a state machine, not a pile of handlers.** Every rule
about what the flow allows — which step follows which, what makes an input
acceptable, what a submit carries — lives in `donation/machine.ts`, which is a
pure reducer. Components only dispatch and render. The prototype kept the same
flow in a mutable object mutated from delegated click handlers, which made
"what can happen next" impossible to see.

**Amounts have exactly one source of truth.** `donation/pricing.ts` decides
who pays the processor fee. Nobody else does arithmetic on money.

**Money never moves through a component.** `donation/submit.ts` turns the
flow's intent into a call on the `PaymentProvider`, and `payments/index.ts`
decides once which provider is in play. No component knows how a donation
actually happens — swapping the simulator for the real backend is a change in
`payments/`, and nothing else.

**Raw card data never reaches our own server.** `PaymentProvider.tokenizeCard`
exists to say so in the type system: the card number and CVC go to the
provider's hosted field or SDK in the browser, and only a single-use token is
sent onward. `http.ts` deliberately does not implement tokenization over HTTP,
because doing so would put this app in PCI scope — which is the one thing the
interface is there to prevent.

**The expensive step is fetched when it is needed.** The card checkout is a
lazy chunk (`CardStep-*.js`), loaded when a donor picks card rather than
shipped to everyone who opens the dialog.

**Memoise what measurably helps, not everything.** State and dispatch are
separate contexts, so dispatch-only components never re-render; and the
checkout's summary pane is memoised because otherwise it re-renders on every
digit of the card number. Arithmetic like `priceOf` is left alone — memoising
it would cost more than it saves.

**A crash must not blank the page.** Three `ErrorBoundary` levels: the whole
app, the campaign grid, and the donation dialog. Without them a render error
anywhere unmounts the entire React tree and the user gets a white screen.

**Accessibility is part of the component, not a later pass.** The dialog is a
native `<dialog>` so focus trapping, Esc and the inert background come from the
platform. Moving between steps focuses the new step's heading, because
replacing a panel would otherwise drop keyboard focus onto the body with
nothing announced. Errors carry `role="alert"`, the receipt is a `<dl>`, the
progress bar is a real `progressbar`, and every control has a visible
`:focus-visible` ring.

## How a donation is priced

The platform takes no fee — the About copy promises "0% platform fee, the full
amount reaches the campaign". The ~2% is what the payment provider keeps, and
the donor chooses who absorbs it:

| Donor chooses | Donor pays | Campaign receives |
| ------------- | ---------- | ----------------- |
| Cover the fee | gift + 2%  | the full gift     |
| Decline it    | the gift   | gift − 2%         |

For a PKR 1,000 gift that is PKR 1,020 in and PKR 1,000 to the campaign, or
PKR 1,000 in and PKR 980 to the campaign. The prototype computed the net as
`gift / 1.02` while telling the donor they had added the fee on top, so a
1,000 gift showed the campaign receiving 980 — inconsistent with its own
label. `donation/pricing.ts` is now the only place this arithmetic lives.

Recurring gifts are fee-free, matching the prototype. That is a business rule
rather than a technical one, so it is a flag (`feeAppliesToRecurring`) instead
of hidden arithmetic, and the fee question is not asked when it does not apply.

## Notes on the card fields

Two things that behave the way they do on purpose:

- **The expiry is `MM / YY` and never rewrites what you type.** An earlier
  version padded a leading 2–9 as a one-digit month, which turned "2029" into
  "02 / 02". Donor input is not silently reinterpreted; the field only inserts
  the separator.
- **The code length follows the card.** Three digits and labelled `CVC` for
  Visa and Mastercard, four digits and labelled `CID` for Amex — enforced in
  the field and again in the reducer, so the form cannot accept a length its
  own validation will reject.

## Phase status

| Phase | Scope                                                                                           | State                       |
| ----- | ----------------------------------------------------------------------------------------------- | --------------------------- |
| 1     | Static prototype fixes (print handout removed, fabricated stats removed, "Cases" → "Campaigns") | done — in the parent folder |
| 1b    | Icon sprite + arch-radius button system                                                         | done — in the parent folder |
| 2     | Scaffold, tokens, app shell, sprite, build tooling                                              | done                        |
| 3     | Campaign data layer: domain model, API module, grid, loading / empty / error                    | done                        |
| 4     | Donation flow: amount, method, Raast, card, receipt, as a reducer state machine                 | done                        |
| 5     | `PaymentProvider` seam, card step code-split, memoisation, accessibility pass, error boundaries | done                        |

## Still to do before launch

- Implement `PaymentProvider.tokenizeCard` with the payment provider's own
  hosted field or SDK, so card payments work against the real provider instead
  of the development simulator. `payments/http.ts` explains why this cannot be
  an HTTP call of our own.
- Point `VITE_API_BASE_URL` at the deployed API, then delete `api/mockData.ts`
  and `payments/simulated.ts`.
- Add authentication and a donor history page if donors should be able to see
  their own receipts.

## The static prototype

`../index.html`, `../styles.css`, `../app.js` and the bundled
`../Neki-prototype.html` are the original hand-written prototype. They are kept
as the design reference; the React app is the replacement. `node
../build/make-single.js` rebuilds the single-file prototype.
