import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { parseCurrentMatchesResponse, getLiveMatches } from "@/lib/scraper";
import { groupBySeries, searchMatches } from "@/lib/matchUtils";
import type { MatchInfo } from "@/lib/types";

const fixtureJson = JSON.parse(
  readFileSync(path.join(__dirname, "fixtures", "sample_currentmatches_response.json"), "utf-8")
);

describe("parseCurrentMatchesResponse", () => {
  const matches = parseCurrentMatchesResponse(fixtureJson);

  it("parses all matches from the fixture", () => {
    expect(matches).toHaveLength(3);
  });

  it("extracts correct fields and formats scores for a match with two innings", () => {
    const pak = matches.find((m) => m.team1 === "Pakistan");
    expect(pak).toBeDefined();
    expect(pak?.team2).toBe("Sri Lanka");
    expect(pak?.team1Score).toBe("245/6 (50 ov)");
    expect(pak?.team2Score).toBe("180/4 (38.2 ov)");
    expect(pak?.matchFormat).toBe("ODI");
    expect(pak?.status.toLowerCase()).toContain("need 66 runs");
  });

  it("derives a series-like label from the match name", () => {
    const pak = matches.find((m) => m.team1 === "Pakistan");
    expect(pak?.seriesName).toBe("Pakistan vs Sri Lanka");
  });

  it("handles a team with no score entry yet (not started) without crashing", () => {
    const kabul = matches.find((m) => m.team1 === "Kabul Zalmi");
    expect(kabul?.team1Score).toBeNull();
    expect(kabul?.team2Score).toBeNull();
  });

  it("handles a match with only one team's score present", () => {
    const indiaW = matches.find((m) => m.team1 === "India Women");
    expect(indiaW?.team1Score).toBe("156/5 (20 ov)");
    expect(indiaW?.team2Score).toBeNull();
  });

  it("returns an empty array when the response has no data array", () => {
    expect(parseCurrentMatchesResponse({})).toEqual([]);
    expect(parseCurrentMatchesResponse(null)).toEqual([]);
  });

  it("skips a match if it doesn't have two valid teams", () => {
    const malformed = { data: [{ id: "1", teams: ["OnlyOneTeam"] }] };
    expect(parseCurrentMatchesResponse(malformed)).toHaveLength(0);
  });
});

describe("getLiveMatches pagination", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.CRICAPI_KEY;

  function makeMatch(i: number) {
    return {
      id: `m-${i}`,
      name: `Team${i}A vs Team${i}B, Match ${i}`,
      matchType: "t20",
      status: "live",
      teams: [`Team${i}A`, `Team${i}B`],
      score: [],
    };
  }

  beforeEach(() => {
    process.env.CRICAPI_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.CRICAPI_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it("stops after a short page and merges all pages fetched so far", async () => {
    const page0 = { status: "success", data: Array.from({ length: 25 }, (_, i) => makeMatch(i)) };
    const page1 = { status: "success", data: Array.from({ length: 10 }, (_, i) => makeMatch(25 + i)) };

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      const isPage0 = url.includes("offset=0");
      return Promise.resolve({
        ok: true,
        json: async () => (isPage0 ? page0 : page1),
      });
    });
    global.fetch = mockFetch as any;

    const matches = await getLiveMatches();

    // page0 had 25 (full page -> keep going), page1 had 10 (short -> stop)
    expect(matches).toHaveLength(35);
    expect(mockFetch).toHaveBeenCalledTimes(2); // didn't fetch a 3rd page
  });

  it("stops at PAGES_TO_FETCH even if every page is full", async () => {
    const fullPage = (offset: number) => ({
      status: "success",
      data: Array.from({ length: 25 }, (_, i) => makeMatch(offset + i)),
    });

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      const offset = Number(new URL(url).searchParams.get("offset"));
      return Promise.resolve({ ok: true, json: async () => fullPage(offset) });
    });
    global.fetch = mockFetch as any;

    const matches = await getLiveMatches();

    expect(mockFetch).toHaveBeenCalledTimes(3); // PAGES_TO_FETCH cap
    expect(matches).toHaveLength(75); // 3 pages * 25
  });

  it("throws a clear error when CRICAPI_KEY is missing", async () => {
    delete process.env.CRICAPI_KEY;
    await expect(getLiveMatches()).rejects.toThrow(/CRICAPI_KEY/);
  });
});

describe("groupBySeries", () => {
  const matches = parseCurrentMatchesResponse(fixtureJson);

  it("groups matches under their derived series label", () => {
    const groups = groupBySeries(matches);
    const pakSeries = groups.find((g) => g.seriesName === "Pakistan vs Sri Lanka");
    expect(pakSeries?.matches).toHaveLength(1);
  });
});

describe("searchMatches", () => {
  const sample: MatchInfo[] = [
    {
      matchId: "1",
      team1: "Pakistan",
      team2: "Sri Lanka",
      team1Score: "245/6",
      team2Score: "180/4",
      status: "live",
      matchFormat: "ODI",
      seriesName: "Pakistan vs Sri Lanka",
      matchUrl: null,
    },
    {
      matchId: "2",
      team1: "India Women",
      team2: "Australia Women",
      team1Score: "156/5",
      team2Score: null,
      status: "live",
      matchFormat: "T20",
      seriesName: "India Women vs Australia Women",
      matchUrl: null,
    },
  ];

  it("filters by team name (case-insensitive)", () => {
    const result = searchMatches(sample, "pakistan");
    expect(result).toHaveLength(1);
    expect(result[0].team1).toBe("Pakistan");
  });

  it("filters by series name", () => {
    const result = searchMatches(sample, "australia women");
    expect(result).toHaveLength(1);
    expect(result[0].team1).toBe("India Women");
  });

  it("returns all matches for an empty query", () => {
    expect(searchMatches(sample, "")).toHaveLength(2);
  });

  it("returns empty array when nothing matches", () => {
    expect(searchMatches(sample, "zzzz-no-match")).toHaveLength(0);
  });
});