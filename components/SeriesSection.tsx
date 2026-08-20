import type { SeriesGroup } from "@/lib/types";
import MatchCard from "./MatchCard";

export default function SeriesSection({ group }: { group: SeriesGroup }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-sm sm:text-base uppercase tracking-[0.15em] text-floodlight/90">
          {group.seriesName}
        </h2>
        <div className="h-px flex-1 bg-linegray" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.matches.map((m) => (
          <MatchCard key={m.matchId} match={m} />
        ))}
      </div>
    </section>
  );
}
