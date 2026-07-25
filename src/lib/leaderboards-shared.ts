/** Client-safe leaderboard helpers (no Neon / fs). */

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  totalPoints: number;
  totalActions: number;
};

export type LeaderboardBoards = {
  day: LeaderboardRow[];
  week: LeaderboardRow[];
  month: LeaderboardRow[];
  allTime: LeaderboardRow[];
};

/** UTC calendar day — leaderboards refresh at most once per day. */
export function leaderboardCacheDay(): string {
  return new Date().toISOString().slice(0, 10);
}
