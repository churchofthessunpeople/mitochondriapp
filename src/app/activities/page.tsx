import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Activities live on Today as an expandable catalog. */
export default function ActivitiesRedirect() {
  redirect(ROUTES.home);
}
