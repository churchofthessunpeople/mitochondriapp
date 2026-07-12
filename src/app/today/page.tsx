import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function TodayRedirect() {
  redirect(ROUTES.home);
}
