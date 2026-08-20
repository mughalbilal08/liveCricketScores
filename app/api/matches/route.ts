/**
 * app/api/matches/route.ts
 * ---------------------------
 * Serverless API route (becomes a Vercel Function on deploy).
 * GET /api/matches -> { matches: MatchInfo[], seriesGroups: SeriesGroup[] }
 *
 * Uses force-dynamic to prevent Next.js from attempting to run Puppeteer
 * during the build phase (which causes build timeouts).
 * Instead, relies on Vercel Edge Network Cache-Control headers to cache 
 * the response for 45 minutes.
 */

import { NextResponse } from "next/server";
import { getLiveMatches, groupBySeries } from "@/lib/scraper";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const matches = await getLiveMatches();
    const seriesGroups = groupBySeries(matches);
    
    return NextResponse.json({
      matches,
      seriesGroups,
      fetchedAt: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=2700, stale-while-revalidate=60'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown scraping error";
    return NextResponse.json(
      { matches: [], seriesGroups: [], error: message },
      { status: 502 }
    );
  }
}