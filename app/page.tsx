"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import CricketBall3D from "@/components/CricketBall3D";
import SearchBar from "@/components/SearchBar";
import SeriesSection from "@/components/SeriesSection";
import { groupBySeries, searchMatches } from "@/lib/matchUtils";
import type { MatchInfo } from "@/lib/types";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // client checks every 5 min; server
// caches the actual CricAPI data for 45 min (see app/api/matches/route.ts
// and lib/scraper.ts), so most of these checks just get the same cached
// data — that's fine and intentional, it's what keeps us under the free
// API tier's daily limit while still pulling 3 pages of matches per cycle.

export default function Home() {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/matches", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load live scores");
      }
      setMatches(data.matches);
      setLastUpdated(data.fetchedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(() => searchMatches(matches, query), [matches, query]);
  const seriesGroups = useMemo(() => groupBySeries(filtered), [filtered]);

  return (
    <div className="min-h-screen flex flex-col bg-floodlight-glow">
      <Navbar />
      
      <main className="flex-1">
        <header className="pt-10 sm:pt-16 pb-12 px-4 text-center">
          <CricketBall3D />
          <h1 className="mt-6 font-display text-5xl sm:text-7xl font-bold tracking-tight text-white drop-shadow-md">
            Live Cricket Scores
          </h1>
          <p className="mt-4 font-body text-chalk/80 text-base sm:text-lg">
            Every live series, one scoreboard. Scores update roughly every 1 minute.
          </p>

          <div className="mt-10">
            <SearchBar value={query} onChange={setQuery} />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-sm font-medium text-chalk/70">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              {lastUpdated ? <span>Updated {new Date(lastUpdated).toLocaleTimeString()}</span> : <span>Updating...</span>}
            </div>
            <span className="text-white/20">|</span>
            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Refresh now
            </button>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-4 pb-24">
          {loading && (
            <p className="text-center font-mono text-sm text-chalk/50 py-16">Loading live scores…</p>
          )}

          {!loading && error && (
            <div className="text-center py-16 max-w-md mx-auto">
              <p className="font-display text-lg text-leather mb-2">Couldn't load live scores</p>
              <p className="font-body text-sm text-chalk/60">{error}</p>
              <p className="font-body text-xs text-chalk/40 mt-3">
                This can happen if ESPNcricinfo changed their page structure. See README.md.
              </p>
            </div>
          )}

          {!loading && !error && seriesGroups.length === 0 && (
            <p className="text-center font-body text-sm text-chalk/50 py-16">
              {query ? `No matches found for "${query}".` : "No live matches right now — check back soon."}
            </p>
          )}

          {!loading && !error && (
            <div className="space-y-12">
              {seriesGroups.map((group) => (
                <SeriesSection key={group.seriesName} group={group} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}