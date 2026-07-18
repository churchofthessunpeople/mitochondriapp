"use server";

import { auth } from "@/auth";
import {
  loadCachedLeaderboardBoards,
  type LeaderboardBoards,
} from "@/lib/leaderboards";

const EMPTY_BOARDS: LeaderboardBoards = {
  day: [],
  week: [],
  month: [],
  allTime: [],
};

/** Lazy-loaded when the user opens the Leaderboard tab (daily server cache). */
export async function getLeaderboardsAction(): Promise<LeaderboardBoards> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.isGuest) return EMPTY_BOARDS;
  return loadCachedLeaderboardBoards();
}
