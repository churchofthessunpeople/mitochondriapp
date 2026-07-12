import { revalidatePath } from "next/cache";
import { APP_REVALIDATE_PATHS } from "@/lib/routes";

/** Revalidate the SPA shell and related secondary routes after mutations. */
export function revalidateApp() {
  for (const path of APP_REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  // Day detail pages under /history/[date]
  revalidatePath("/history", "layout");
}
