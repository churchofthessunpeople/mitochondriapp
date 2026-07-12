import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Place is expanded on /app Today — no separate tab. */
export default function PlaceRedirect() {
  redirect(ROUTES.home);
}
