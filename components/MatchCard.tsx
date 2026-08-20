import type { MatchInfo } from "@/lib/types";
import { ListVideo, Calendar } from "lucide-react";

function TeamRow({ name, score, logo }: { name: string; score: string | null; logo?: string | null }) {
  // If score looks like "168/6 (20.0)", we can split it for better styling,
  // or just display it as is. Let's try splitting if it contains parentheses.
  let mainScore = score ?? "";
  let overs = "";
  if (score && score.includes("(")) {
    const parts = score.split("(");
    mainScore = parts[0].trim();
    overs = "(" + parts[1];
  }

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt={`${name} logo`} className="w-5 h-5 object-contain rounded-[2px]" />
        ) : (
          <div className="w-5 h-5 rounded-[2px] bg-white/10 flex items-center justify-center">
             <span className="text-[9px] font-bold text-white/50 tracking-tighter">{name.substring(0, 2).toUpperCase()}</span>
          </div>
        )}
        <span className="font-display font-medium text-chalk text-[15px]">{name}</span>
      </div>
      {score ? (
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-white font-bold">{mainScore}</span>
          {overs && <span className="font-mono text-chalk/50 text-xs">{overs}</span>}
        </div>
      ) : (
        <span className="font-mono text-chalk/50 text-sm">—</span>
      )}
    </div>
  );
}

export default function MatchCard({ match }: { match: MatchInfo }) {
  const isUpcoming = !match.team1Score && !match.team2Score && !match.status.toLowerCase().includes("won");
  const isFinished = match.status.toLowerCase().includes("won") || match.status.toLowerCase().includes("abandoned");
  const isInProgress = !isUpcoming && !isFinished;

  let tagText = "UPCOMING";
  let tagColor = "bg-white/10 text-white/70";

  if (isInProgress) {
    tagText = "IN PROGRESS";
    tagColor = "bg-yellow-500/20 text-yellow-500";
  } else if (match.status.toLowerCase().includes("live")) {
    tagText = "LIVE";
    tagColor = "bg-red-500/20 text-red-500";
  }

  let statusColor = "text-chalk/60";
  if (match.status.toLowerCase().includes("won")) {
    statusColor = "text-green-400";
  } else if (match.status.toLowerCase().includes("lead") || match.status.toLowerCase().includes("trail") || match.status.toLowerCase().includes("require")) {
    statusColor = "text-yellow-500";
  }

  const content = (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-5 hover:bg-black/60 transition-colors">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${tagColor}`}>
            {tagText}
          </span>
          <span className="text-xs text-chalk/50 truncate">
            {match.seriesName || match.matchFormat}
          </span>
        </div>

        <div className="space-y-1 mb-4">
          <TeamRow name={match.team1} score={match.team1Score} logo={match.team1Logo} />
          <TeamRow name={match.team2} score={match.team2Score} logo={match.team2Logo} />
        </div>

        <p className={`text-xs font-medium ${statusColor} mb-6 line-clamp-2 min-h-[1rem]`}>
          {match.status || "Match yet to begin"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isUpcoming ? (
           <button className="flex items-center gap-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              VIEW FIXTURE
           </button>
        ) : (
           <button className="flex items-center gap-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-colors">
              <ListVideo className="w-3.5 h-3.5" />
              SCORECARD
           </button>
        )}
      </div>
    </div>
  );

  if (match.matchUrl) {
    const href = match.matchUrl.startsWith("http")
      ? match.matchUrl
      : `https://www.espncricinfo.com${match.matchUrl}`;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return <div className="h-full">{content}</div>;
}
