import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Admin opens as an in-page card on Account → Profile. */
export default function AdminRedirect() {
  redirect(ROUTES.account);
}
