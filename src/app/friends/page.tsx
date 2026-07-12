import { redirect } from "next/navigation";

export default function FriendsRedirect() {
  redirect("/app?t=friends");
}
