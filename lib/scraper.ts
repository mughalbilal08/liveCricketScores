/**
 * lib/scraper.ts
 * -----------------
 * Server-side data fetcher for live cricket scores.
 *
 * This version uses Puppeteer to scrape the DOM directly from ESPNcricinfo,
 * bypassing Akamai Bot Manager which previously blocked simple fetch() calls.
 */

import type { MatchInfo } from "./types";

export async function getLiveMatches(): Promise<MatchInfo[]> {
  let browser;
  try {
    let puppeteer;
    let launchOptions: any = {};

    if (process.env.VERCEL) {
      // In Vercel, use puppeteer-core and @sparticuz/chromium
      const puppeteerMod = await import('puppeteer-core');
      puppeteer = puppeteerMod.default || puppeteerMod;
      const chromiumMod = await import('@sparticuz/chromium');
      const chromium = (chromiumMod.default || chromiumMod) as any;
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    } else {
      // Locally, use standard puppeteer and local Chrome
      const puppeteerMod = await import('puppeteer');
      puppeteer = puppeteerMod.default || puppeteerMod;
      launchOptions = {
        headless: true,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to live scores
    await page.goto('https://www.espncricinfo.com/live-cricket-score', { waitUntil: 'domcontentloaded' });

    // Wait for the match cards to render
    try {
      await page.waitForSelector('.ds-text-tight-m', { timeout: 10000 });
    } catch (e) {
      console.warn("Selector not found within timeout, returning empty array.");
      return [];
    }

    // Extract match data
    const matches: MatchInfo[] = await page.evaluate(() => {
      const results: any[] = [];
      document.querySelectorAll('div.ds-flex.ds-flex-col.ds-mt-2.ds-mb-2').forEach((el, index) => {
        const teamRows = el.querySelectorAll('.ds-flex.ds-justify-between.ds-items-center');

        if (teamRows.length >= 2) {
          const team1El = teamRows[0];
          const team2El = teamRows[1];

          const team1Name = (team1El.querySelector('.ds-text-tight-m, .ds-text-tight-l') as HTMLElement)?.innerText || '';
          const team1Logo = (team1El.querySelector('img') as HTMLImageElement)?.src || null;
          const team1Score = (team1El.querySelector('strong') as HTMLElement)?.innerText || (team1El.querySelector('.ds-text-compact-m') as HTMLElement)?.innerText || null;

          const team2Name = (team2El.querySelector('.ds-text-tight-m, .ds-text-tight-l') as HTMLElement)?.innerText || '';
          const team2Logo = (team2El.querySelector('img') as HTMLImageElement)?.src || null;
          const team2Score = (team2El.querySelector('strong') as HTMLElement)?.innerText || (team2El.querySelector('.ds-text-compact-m') as HTMLElement)?.innerText || null;

          const statusEl = el.nextElementSibling || el.parentElement?.querySelector('.ds-text-tight-s.ds-truncate');
          let status = statusEl ? (statusEl as HTMLElement).innerText.trim() : 'Live';

          let seriesName = 'Other matches';
          let matchFormat = 'TEST'; // Default

          const cardContainer = el.closest('.ds-text-compact-xxs, .ds-border, [class*="ds-rounded"]');
          if (cardContainer) {
            const headerEl = cardContainer.querySelector('.ds-text-tight-xs, .ds-text-tight-s');
            if (headerEl) {
              const headerText = (headerEl as HTMLElement).innerText.trim();
              seriesName = headerText;

              const lowerHeader = headerText.toLowerCase();
              if (lowerHeader.includes('t20')) matchFormat = 'T20';
              else if (lowerHeader.includes('odi')) matchFormat = 'ODI';
              else if (lowerHeader.includes('test')) matchFormat = 'TEST';
              else if (lowerHeader.includes('fc') || lowerHeader.includes('first class')) matchFormat = 'FC';
              else matchFormat = 'OTHER';
            }
          }

          results.push({
            matchId: `espn-${index}`,
            team1: team1Name.trim(),
            team1Logo,
            team2: team2Name.trim(),
            team2Logo,
            team1Score: team1Score ? team1Score.trim() : null,
            team2Score: team2Score ? team2Score.trim() : null,
            status,
            seriesName,
            matchFormat,
            matchUrl: null
          });
        }
      });
      return results;
    });

    return matches;

  } catch (error) {
    console.error("Error scraping matches:", error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export { groupBySeries, searchMatches } from "./matchUtils";