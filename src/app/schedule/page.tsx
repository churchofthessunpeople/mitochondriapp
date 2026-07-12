import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function ScheduleRedirect() {
  redirect(ROUTES.home);
}
