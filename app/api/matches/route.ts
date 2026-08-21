/**
 * app/api/matches/route.ts
 * ---------------------------
 * Serverless API route (becomes a Vercel Function on deploy).
 * GET /api/matches -> { matches: MatchInfo[], seriesGroups: SeriesGroup[] }
 *
 * Caches its response for 15 minutes (matching lib/scraper.ts's fetch
 * revalidate window) so the free-tier CricAPI limit (100 requests/day)
 * isn't exceeded no matter how many clients poll this route or how often.
 * `force-dynamic` was removed on purpose — it would disable this caching.
 */

import { NextResponse } from "next/server";
import { getLiveMatches, groupBySeries } from "@/lib/scraper";

export const revalidate = 60; // 1 minute
export const maxDuration = 60; // Allow Vercel to run up to 60s for the scraper

export async function GET() {
  try {
    const matches = await getLiveMatches();
    const seriesGroups = groupBySeries(matches);
    return NextResponse.json({
      matches,
      seriesGroups,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown scraping error";
    return NextResponse.json(
      { matches: [], seriesGroups: [], error: message },
      { status: 502 }
    );
  }
}
