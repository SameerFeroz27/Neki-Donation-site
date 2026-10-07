# Neki — donation platform frontend

Neki is a donation platform for verified campaigns. A donor picks a campaign,
chooses an amount, and pays by **Raast request-to-pay** or by **card**.

This repository holds the **frontend only**. There is no backend in it, so the
application runs on sample data — see
[Running without an API](#running-without-an-api).

## What is in here

| Path                                | What it is                                                        |
| ----------------------------------- | ----------------------------------------------------------------- |
| `web/`                              | The application — React 19, Vite, TypeScript                       |
| `index.html`, `styles.css`, `app.js`| The original hand-written prototype, kept as the design reference  |
| `Neki-prototype.html`               | That prototype bundled into one self-contained file                |
| `build/make-single.js`              | Rebuilds that bundle: `node build/make-single.js`                  |
| `Neki-blueprint.html`               | The design blueprint the prototype was built from                  |
| `image1`–`image3`                   | Original design mockups                                            |

The prototype needs no build step — open `index.html` in a browser.

## Quick start

Needs Node `^20.19.0 || >=22.12.0`, which is Vite 8's requirement.

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

| Script                                                         | What it does                              |
| -------------------------------------------------------------- | ----------------------------------------- |
| `npm run dev`                                                   | Dev server with HMR on port 5173          |
| `npm run build`                                                 | Typecheck, then a production build        |
| `npm run preview`                                               | Serve the built output                    |
| `npm run typecheck` · `npm run lint` · `npm run format`          | Checks and formatting                     |

Structure, conventions, and the reasoning behind both are in
**[web/README.md](web/README.md)**.

## Running without an API

The app is written against an API that does not exist yet, so it ships with
sample campaigns and uses them whenever no API is configured.

| Configuration             | Result                        |
| ------------------------- | ----------------------------- |
| nothing set               | sample data                   |
| `VITE_API_BASE_URL=…`     | sample data off, API used     |
| `VITE_USE_MOCK_API=false` | sample data off               |
| `VITE_USE_MOCK_API=true`  | sample data on                |

So a plain build needs no configuration at all. `cd web && npm run build`
produces a site with six sample campaigns and a complete, clickable donation
flow: amount, Raast request-to-pay, card checkout, receipt.

Two things are deliberately kept honest:

- While the sample campaigns are in use, the campaign section says so.
- Platform totals are never invented. With no API the hero tiles show a dash,
  never a made-up figure.

**Payments are simulated.** No money moves and no card is charged. Real card
payments additionally need a tokenizer from the payment provider, which is not
implemented — `web/src/payments/http.ts` explains why this frontend must never
send card details to its own server.

## Deploying

`web/` builds to a static `dist/`, so any static host works. On Vercel, point
the project at the `web` directory: the framework preset and build command are
detected, and a demo deployment needs no environment variables or command
overrides.

For a real deployment set `VITE_API_BASE_URL` to the API origin — the sample
data switches itself off, with no flag to remember.

> A sample-data deployment shows invented campaigns with a "verified" badge, so
> treat a demo deployment as internal.

## Design

Deep green and gold only, on warm ivory paper, with a khatam (eight-point star)
pattern behind the page and a mihrab arch on each campaign card. Green reads as
trust, gold as generosity.

Every colour, radius and shadow lives in `web/src/styles/tokens.css`; no
component hard-codes one.

## Not done yet

- **No backend.** Campaigns, totals and payments all come from the fixtures.
- **Card payments need a real tokenizer** before they can be enabled for real.
- No donor accounts, no email receipts, and no admin for creating campaigns.
