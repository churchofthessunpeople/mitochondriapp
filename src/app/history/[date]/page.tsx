import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Day detail opens as an in-page card on Account → History. */
export default function HistoryDayRedirect() {
  redirect(ROUTES.history);
}
