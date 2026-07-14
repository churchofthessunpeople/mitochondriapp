import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Admin opens as an in-page sheet on /app. */
export default function AdminRedirect() {
  redirect(ROUTES.admin);
}
