# Interview Preparation Guide: Live Cricket Scores App

This guide is designed to help you confidently explain and defend the architecture, tech stack, and design decisions of your Cricket Live Scores app during a technical interview.

## 1. Project Overview & Architecture

Your application is a **Full-Stack Web Application** built using **Next.js 14 (App Router)**. It acts as both the frontend client and the backend server. 

- **Frontend:** React components, styled with Tailwind CSS, running on the client.
- **Backend (API):** Next.js Serverless API routes (`/api/matches`) that fetch the data.
- **Data Source:** Real-time data is scraped directly from ESPNCricinfo using **Puppeteer** (a headless browser automation tool).

---

## 2. Why Puppeteer? (The Most Important Question)

If an interviewer asks, *"Why did you use Puppeteer instead of a simple API call (`fetch` or `axios`)?"*, this is your moment to shine.

**Your Answer:**
> "Initially, the easiest way to get cricket data would be a simple `fetch()` request or using an open API. However, reliable cricket APIs are either very expensive or heavily rate-limited. 
> 
> To get real-time, accurate data for free, I decided to pull data from ESPNCricinfo. However, ESPNCricinfo (like many modern enterprise sites) uses **Akamai Bot Manager** and Cloudflare to aggressively block automated scripts. A standard `fetch()` or `axios` request gets blocked immediately with a 403 Forbidden error or a CAPTCHA challenge. 
>
> To bypass this bot protection, I used **Puppeteer**. Puppeteer launches a real instance of Google Chrome in 'headless' mode. It executes JavaScript, renders the DOM, and sets realistic User-Agent headers, making our scraper look exactly like a real human browsing the site. This allows us to reliably read the live scores directly from the DOM."

### Key concepts to mention:
- **Headless Browser:** A web browser without a graphical user interface.
- **Bot Mitigation / Akamai:** Security layers that block simple HTTP requests.
- **DOM Evaluation:** We use `page.evaluate()` to run JavaScript *inside* the browser context to scrape the HTML elements (like team names, scores, and logos).

---

## 3. How the Scraping Works (Step-by-Step)

If asked how the scraper works under the hood (found in [`lib/scraper.ts`](file:///e:/cricket-live-app/lib/scraper.ts)), explain this flow:

1. **Environment Detection:** The app checks if it's running locally or on Vercel (`process.env.VERCEL`). 
   - *Locally:* It uses standard `puppeteer` and your local Chrome installation.
   - *Production (Vercel):* It uses `puppeteer-core` and `@sparticuz/chromium`, which is a specially compressed version of Chromium designed to fit inside the strict size limits (50MB) of AWS Lambda / Vercel Serverless functions.
2. **Dynamic Imports:** We use `await import('puppeteer')` instead of `require()`. Next.js Webpack gets confused by Node.js native modules; dynamic imports ensure Next.js handles it properly at runtime.
3. **Navigation & Waiting:** The browser goes to the live scores URL and waits for a specific CSS selector (`.ds-text-tight-m`) to appear. This is crucial because modern sites load data asynchronously via React/Angular. If we don't wait, we might scrape an empty page.
4. **Data Extraction:** Inside `page.evaluate()`, we query the DOM using standard Javascript (`document.querySelectorAll`). We extract team names, scores, match status, team logos (`img.src`), and the match URL (`a.href`).
5. **Browser Cleanup:** We wrap the logic in a `try/finally` block to ensure `browser.close()` is always called. *Crucial for interviews:* Explain that failing to close the browser causes memory leaks and will crash the server.

---

## 4. Folder Structure Explained

Here is how you should explain the Next.js App Router structure:

* **`/app`**: The core of Next.js 14 App Router.
  * **`page.tsx`**: The main frontend React component (the homepage). It uses a `useEffect` to poll our backend API every 5 minutes.
  * **`layout.tsx`**: The global HTML wrapper. We inject our fonts (Oswald, Work Sans) and set our fixed background here.
  * **`globals.css`**: Global Tailwind CSS styles and custom base styles.
  * **`/app/api/matches/route.ts`**: The Backend API Endpoint. When the frontend requests `/api/matches`, this route executes our scraper and returns the data as JSON.

* **`/components`**: Reusable React components.
  * **`MatchCard.tsx`**: The UI component for a single match. It handles conditional logic (e.g., showing a fallback avatar if a team logo is missing, applying "LIVE" or "UPCOMING" tags based on match status).
  * **`SearchBar.tsx`, `SeriesSection.tsx`, etc.**: Modular UI components to keep `page.tsx` clean.

* **`/lib`**: Helper functions and backend logic.
  * **`scraper.ts`**: The Puppeteer scraping engine.
  * **`types.ts`**: TypeScript interfaces (e.g., `MatchInfo`). *Interview tip:* Mention that using TypeScript ensures data consistency between the scraper and the frontend components.
  * **`matchUtils.ts`**: Utility functions for grouping matches by series and handling search filtering.

---

## 5. Potential Interview Questions & Answers

**Q: Isn't launching a browser for every API request very slow and resource-heavy?**
> **A:** "Yes, Puppeteer is heavy. Launching a browser takes a few seconds. To mitigate this, Next.js caches the API response. The frontend polls every 5 minutes, and the server caches the data. This means we aren't launching a browser for every single user visit, only when the cache expires, saving immense server resources."

**Q: How did you handle the layout breaking on mobile browsers?**
> **A:** "I noticed the background image was rendering as a black screen on iOS Safari. This is a known bug with the CSS property `background-attachment: fixed` on mobile. I solved it by removing `bg-fixed` and instead creating a dedicated background `<div>` with `position: fixed` and `z-index: -10` in my `layout.tsx`. This perfectly replicated the effect across all devices."

**Q: What happens if the source website changes its HTML structure?**
> **A:** "That is the primary tradeoff of DOM scraping. If ESPNCricinfo changes their CSS classes (like `.ds-text-tight-m`), the scraper will break. To handle this, I wrapped the scraping logic in `try/catch` blocks. If the selector isn't found within a timeout, it gracefully catches the error and returns an empty array, preventing the entire application from crashing. The UI will then show a user-friendly error message."
