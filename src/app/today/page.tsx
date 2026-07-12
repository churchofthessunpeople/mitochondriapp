import { redirect } from "next/navigation";

/** Legacy route — daily checklist lives on Schedule; place is home. */
export default function TodayRedirectPage() {
  redirect("/schedule");
}
