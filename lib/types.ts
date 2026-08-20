export interface MatchInfo {
  matchId: string;
  team1: string;
  team1Logo: string | null;
  team2: string;
  team2Logo: string | null;
  team1Score: string | null;
  team2Score: string | null;
  status: string;
  matchFormat: string | null;
  seriesName: string;
  matchUrl: string | null;
}

export interface SeriesGroup {
  seriesName: string;
  matches: MatchInfo[];
}
