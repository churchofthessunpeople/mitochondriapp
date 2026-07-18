"use server";

import { auth } from "@/auth";
import {
  loadCachedLeaderboardBoards,
  type LeaderboardBoards,
} from "@/lib/leaderboards";

/** Lazy-loaded when the user opens the Leaderboard tab (daily server cache). */
export async function getLeaderboardsAction(): Promise<LeaderboardBoards> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return loadCachedLeaderboardBoards();
}
