import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Scoring guide opens as an in-page card on /app. */
export default function RegionScoringRedirect() {
  redirect(ROUTES.home);
}
