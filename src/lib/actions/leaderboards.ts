"use server";

import {
  getLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
} from "@/lib/data";
import type { LeaderboardBoards } from "@/components/leaderboard-panel";

/** Lazy-loaded when the user opens the Leaderboard tab. */
export async function getLeaderboardsAction(): Promise<LeaderboardBoards> {
  const [week, month, allTime] = await Promise.all([
    getWeeklyLeaderboard(25),
    getMonthlyLeaderboard(25),
    getLeaderboard(25),
  ]);
  return { week, month, allTime };
}
