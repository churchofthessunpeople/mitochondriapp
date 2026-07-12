/** Primary app tabs (activities live inside Schedule as expandable catalog). */
export const APP_TABS = ["schedule", "place", "account"] as const;

export type AppTab = (typeof APP_TABS)[number];

export function isAppTab(value: string | null | undefined): value is AppTab {
  return value === "schedule" || value === "place" || value === "account";
}

export function tabFromSearchParam(
  raw: string | string[] | undefined,
): AppTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  // Legacy ?t=activities → schedule (catalog is expanded on that surface)
  if (v === "activities") return "schedule";
  return isAppTab(v) ? v : "schedule";
}
