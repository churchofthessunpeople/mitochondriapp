import { redirect } from "next/navigation";

export default function PlaceRedirect() {
  redirect("/app?t=place");
}
