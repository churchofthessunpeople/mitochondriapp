import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** Friends UI is not shipped yet — keep deep links from landing on Account. */
export default function FriendsRedirect() {
  redirect(ROUTES.account);
}
