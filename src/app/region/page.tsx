import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Regions open as an in-page card on /app (Today → Place). */
export default function RegionRedirect() {
  redirect(ROUTES.home);
}
