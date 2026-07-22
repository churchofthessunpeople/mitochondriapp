import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Activities live on Today via Edit activities under Sunrise. */
export default function ActivitiesRedirect() {
  redirect(ROUTES.home);
}
