/**
 * lib/matchUtils.ts
 * --------------------
 * Pure helper functions with no server-only dependencies (no cheerio, no
 * fetch), so they're safe to import from client components as well as
 * the server-side scraper.
 */

import Fuse from "fuse.js";
import type { MatchInfo, SeriesGroup } from "./types";

export function groupBySeries(matches: MatchInfo[]): SeriesGroup[] {
  const groups = new Map<string, MatchInfo[]>();
  for (const m of matches) {
    const key = m.seriesName || "Other matches";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries()).map(([seriesName, ms]) => ({
    seriesName,
    matches: ms,
  }));
}

export function searchMatches(matches: MatchInfo[], query: string): MatchInfo[] {
  const q = query.trim();
  if (!q) return matches;
  
  const fuse = new Fuse(matches, {
    keys: ["team1", "team2", "seriesName"],
    threshold: 0.4, // Allows for typos like 'paksitan' instead of 'pakistan'
  });

  return fuse.search(q).map((result) => result.item);
}
