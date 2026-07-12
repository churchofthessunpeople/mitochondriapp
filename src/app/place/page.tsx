import { redirect } from "next/navigation";

/** Place is expanded on /app Today — no separate tab. */
export default function PlaceRedirect() {
  redirect("/app");
}
