import { unstable_cache } from "next/cache";
import {
  getDailyLeaderboard,
  getLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
} from "@/lib/data";

export type LeaderboardBoards = {
  day: Awaited<ReturnType<typeof getLeaderboard>>;
  week: Awaited<ReturnType<typeof getLeaderboard>>;
  month: Awaited<ReturnType<typeof getLeaderboard>>;
  allTime: Awaited<ReturnType<typeof getLeaderboard>>;
};

/** UTC calendar day — leaderboards refresh at most once per day. */
export function leaderboardCacheDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Shared daily cache across users. Auth is checked by the server action caller.
 */
export async function loadCachedLeaderboardBoards(): Promise<LeaderboardBoards> {
  const day = leaderboardCacheDay();
  return unstable_cache(
    async (): Promise<LeaderboardBoards> => {
      const [dayBoard, week, month, allTime] = await Promise.all([
        getDailyLeaderboard(25),
        getWeeklyLeaderboard(25),
        getMonthlyLeaderboard(25),
        getLeaderboard(25),
      ]);
      return { day: dayBoard, week, month, allTime };
    },
    ["leaderboards-v6-label-fallback", day],
    { revalidate: 86_400, tags: ["leaderboards"] },
  )();
}
