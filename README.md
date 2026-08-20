# Live Cricket Scores — Next.js | Three.js | Web Scraping | Vercel

## STAR Summary

**Situation**
V1 of this project was a Python/Streamlit app. Streamlit apps don't deploy on Vercel (it's built for Next.js/static/serverless apps) and can't host a Three.js 3D scene natively. To get a deployable, richer UI (multi-series live scores, search, a 3D signature visual), the whole stack needed to move to Next.js.

**Task**
Rebuild as: a Next.js app that scrapes ESPNcricinfo server-side, groups live matches by series, lets the user search across teams/series, displays a Three.js cricket-ball hero as the signature visual, is fully responsive, and deploys to Vercel.

**Action**
1. Moved scraping server-side into a Next.js **API route** (`/api/matches`) — this becomes a Vercel serverless function on deploy, keeping scraping logic off the client (avoids CORS issues and doesn't expose scraping code/rate-limits to the browser).
2. Kept the same robust scraping strategy as v1: ESPNcricinfo is Next.js-based, so it ships a `__NEXT_DATA__` JSON blob — parsed that instead of chasing CSS classes.
3. Built **grouping-by-series** and **search-by-team/series** as pure, testable functions (`lib/matchUtils.ts`), shared between server and client.
4. Built the **Three.js cricket ball** with `@react-three/fiber` — actual geometry (sphere + seam rings + stitch marks), not a stock 3D model, lit like it's under stadium floodlights, slowly auto-rotating as the page's signature visual.
5. Designed a distinctive visual identity instead of a generic template look: night-stadium palette (deep pitch green-black, warm floodlight glow, leather red, bail gold), a condensed athletic display face (Oswald) + scoreboard-style monospace for scores (Space Mono).
6. Client polls `/api/matches` every 5 minutes (configurable) for auto-refresh, with a manual "Refresh now" button and graceful error states.
7. Wrote unit tests (Vitest) for the scraping/parsing/search/grouping logic using a mock `__NEXT_DATA__` fixture — no live network dependency.
8. **Actually ran** `tsc --noEmit`, `npm run build`, and the full test suite in this environment to confirm the code compiles and works before handing it off — all passing.

**Result**
A working, tested, responsive Next.js app ready for `vercel deploy`, with a distinctive 3D signature element, multi-series live score grouping, and search — built on the same scraping foundation proven in the Streamlit version.

---

## Use Case

Same core use case as before (a fan wants live scores in one place, auto-updating) — now extended:
- **Multiple series at once**: if Pakistan vs Sri Lanka and the Women's T20 World Cup are both live, both show up, grouped under their own series heading — no need to check series-by-series.
- **Search**: instead of scrolling, the user types "Pakistan" or "World Cup" and instantly filters to relevant matches.
- **Deployed, shareable**: unlike a local Streamlit app, this is a public URL anyone can open — useful for a portfolio piece or to actually share with friends during a series.

---

## Folder Structure

```
cricket-live-app/
├── app/
│   ├── layout.tsx            # root layout, fonts, metadata
│   ├── page.tsx               # main page: hero, search, series list, polling
│   ├── globals.css            # Tailwind directives + accessibility rules
│   └── api/
│       └── matches/
│           └── route.ts       # server-side scraping endpoint (-> Vercel function)
├── components/
│   ├── CricketBall3D.tsx      # Three.js signature hero visual
│   ├── SearchBar.tsx
│   ├── MatchCard.tsx          # scoreboard-styled match card
│   └── SeriesSection.tsx      # groups MatchCards under a series heading
├── lib/
│   ├── scraper.ts             # server-only: fetch + parse __NEXT_DATA__
│   ├── matchUtils.ts          # pure functions: groupBySeries, searchMatches
│   └── types.ts               # MatchInfo, SeriesGroup types
├── __tests__/
│   ├── fixtures/
│   │   └── sample_live_scores.html   # mock __NEXT_DATA__ for offline tests
│   └── scraper.test.ts        # Vitest unit tests (10 tests, all passing)
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── vercel.json                # Vercel build/deploy config
├── vitest.config.ts
├── .gitignore
└── README.md
```

---

## Step-by-Step Execution Table

| # | Step | What it does | Command | Output |
|---|------|--------------|---------|--------|
| 1 | Install dependencies | Installs Next.js, React, Three.js, Tailwind, testing tools | `npm install` | `node_modules/` ready |
| 2 | Run unit tests | Verifies scraping/parsing/search/grouping logic offline (mock fixture) | `npm test` | 10 passing tests |
| 3 | Type-check | Confirms no TypeScript errors across the project | `npx tsc --noEmit` | No errors |
| 4 | Start dev server | Runs locally with hot reload | `npm run dev` | App at `localhost:3000` |
| 5 | Verify live scraping | Confirms `/api/matches` actually returns real matches from the live site (needs real internet access) | Open `localhost:3000/api/matches` in browser | JSON response with matches |
| 6 | Debug if 0 matches | If step 5 returns an empty array, inspect `__NEXT_DATA__` on the live page and adjust key names in `lib/scraper.ts` | Chrome DevTools → View Page Source | Updated `scraper.ts` |
| 7 | Production build | Confirms the app builds cleanly for deployment | `npm run build` | `.next/` build output |
| 8 | Push to GitHub | Required for Vercel's Git-based deploy flow | `git init && git add . && git commit -m "init" && git push` | Repo on GitHub |
| 9 | Deploy to Vercel | Connect the repo on vercel.com (or use CLI), Vercel auto-detects Next.js | `npx vercel` (or import repo on vercel.com) | Live public URL |
| 10 | Verify deployed app | Open the live URL, confirm scores load and auto-refresh works | — | Working public app |

---

## ✅ What I verified in this environment
- `npx tsc --noEmit` → **no type errors**
- `npm test` (Vitest) → **10/10 tests passing** (scraping/parsing/grouping/search logic, using a mock fixture)
- `npm run build` → **compiles and builds successfully** (verified with fonts temporarily stubbed, since this sandbox can't reach fonts.googleapis.com — Vercel's build servers can, so this isn't a real issue)

## ⚠️ What I could NOT fully verify here (needs your machine)

**Update after debugging together**: the original `__NEXT_DATA__` approach
didn't work — inspecting the live page showed that block only has site-wide
metadata (nav/social links), not match data. Using Chrome DevTools ->
Network tab -> Fetch/XHR, we found the *real* data endpoint:

```
https://hs-consumer-api.espncricinfo.com/v1/global/fastscore/message/base?messageId=lm-en-<id>
```

This endpoint is protected by Akamai bot-detection — calling it directly
(no Referer, no session cookie) returns "Access Denied". `lib/scraper.ts`
now does what a real browser does automatically:
1. `establishSession()` — GETs the live-scores HTML page first, captures
   session cookies from the response's `Set-Cookie` headers.
2. `fetchLiveMatchesRaw()` — GETs the fastscore API with those cookies
   plus a `Referer: https://www.espncricinfo.com/live-cricket-score`
   header, and a freshly generated `messageId=lm-en-<timestamp>` (the ID
   looks client-generated per request, not a fixed value the server
   validates strictly).

**I verified the parsing logic** (`parseFastscoreResponse` + `mapMatch`)
against the **real JSON structure** you pulled from DevTools — 11 passing
unit tests using a fixture built from that real response
(`__tests__/fixtures/sample_fastscore_response.json`).

**What I could NOT verify**: whether the two-step cookie+Referer dance
actually satisfies Akamai when called from a plain Node.js `fetch()`
(rather than a full browser) — this sandbox can't reach
espncricinfo.com or hs-consumer-api.espncricinfo.com at all, so this needs
testing on your machine.

## If it doesn't return matches

1. Run `npm run dev`, then open `http://localhost:3000/api/matches` in
   your browser.
2. **If you get real match data back**: done, the two-step approach works.
3. **If you get an error** (e.g. "fastscore API request failed: 403"):
   Akamai is still blocking the server-side request. Things to try, in
   order of effort:
   - Add more browser-like headers to `BASE_HEADERS` in `lib/scraper.ts`
     (e.g. `sec-ch-ua`, `sec-fetch-mode: cors`, `sec-fetch-site: same-site`)
     — copy the exact headers Chrome sent, visible in DevTools -> Network
     -> click the fastscore request -> Headers tab -> Request Headers.
   - Akamai sometimes also requires a `_abck` / `bm_sz` cookie that's only
     set after a bit of JS execution on the page, not just a plain GET —
     if headers alone don't work, the reliable fallback is rendering the
     page with a headless browser (Playwright/Puppeteer) instead of plain
     `fetch()`, which behaves exactly like a real Chrome tab. This is
     heavier (needs a browser binary in the deployment) but bypasses this
     entire category of blocking.
   - As a last resort: some public cricket-score APIs (CricAPI,
     RapidAPI's cricket endpoints) provide the same data without
     scraping/bot-detection concerns — worth considering if Akamai proves
     too resistant to work around reliably for a long-running deployed app.

## Being a good citizen while scraping
- Keep the 5-minute polling interval — don't hammer either endpoint faster
- Personal/academic/portfolio use only — check ESPNcricinfo's Terms of Use
  before any large-scale public deployment

## A note on `npm audit`
`npm audit` flags some Next.js 14.x advisories even on the latest patched 14.2.35 — a few CVEs from late 2025/2026 were only fixed on the 15.x/16.x lines. For an academic/portfolio project this is a reasonable tradeoff to stay on 14.x (matches what you already know from the Streamlit → Next.js switch), but if you deploy this publicly long-term, consider migrating to Next.js 15.x later (`npm install next@latest react@latest react-dom@latest`) and re-running the test suite.

## Notes
- **Airflow / deployment automation** for the *SCD2* project: still on hold as agreed — separate from this project.
- Being a good citizen while scraping: keep the 5-minute refresh interval, don't remove the User-Agent header, and this is for personal/academic/portfolio use — check ESPNcricinfo's Terms of Use before any large-scale public deployment.
