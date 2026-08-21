/**
 * app/api/matches/route.ts
 * ---------------------------
 * Serverless API route (becomes a Vercel Function on deploy).
 * GET /api/matches -> { matches: MatchInfo[], seriesGroups: SeriesGroup[] }
 *
 * Uses Cache-Control headers to cache the response at the Vercel Edge Network
 * for 60 seconds. This avoids Next.js attempting to prerender this route
 * during the build process (which causes timeouts with Puppeteer).
 */

import { NextResponse } from "next/server";
import { getLiveMatches, groupBySeries } from "@/lib/scraper";

export const dynamic = 'force-dynamic'; // Prevent build-time prerendering
export const maxDuration = 60; // Allow Vercel to run up to 60s for the scraper

export async function GET() {
  try {
    const matches = await getLiveMatches();
    const seriesGroups = groupBySeries(matches);
    return NextResponse.json(
      {
        matches,
        seriesGroups,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          // Cache at Vercel Edge for 60 seconds, serve stale while revalidating
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown scraping error";
    return NextResponse.json(
      { matches: [], seriesGroups: [], error: message },
      { status: 502 }
    );
  }
}
