import "server-only";

import { unstable_cache } from "next/cache";
import {
  getDailyLeaderboard,
  getLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
} from "@/lib/data";
import {
  leaderboardCacheDay,
  type LeaderboardBoards,
} from "@/lib/leaderboards-shared";

export type { LeaderboardBoards };
export { leaderboardCacheDay };

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
