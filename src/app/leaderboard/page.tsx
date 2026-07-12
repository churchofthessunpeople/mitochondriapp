import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function LeaderboardRedirect() {
  redirect(ROUTES.leaderboard);
}
