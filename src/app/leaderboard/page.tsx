import { redirect } from "next/navigation";

export default function LeaderboardRedirect() {
  redirect("/app?t=leaderboard");
}
