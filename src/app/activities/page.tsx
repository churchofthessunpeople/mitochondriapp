import { redirect } from "next/navigation";

/** Activities live on Today as an expandable catalog. */
export default function ActivitiesRedirect() {
  redirect("/app");
}
