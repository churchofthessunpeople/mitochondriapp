/** Primary tabs: Place lives collapsed on Today. */
export const APP_TABS = ["schedule", "account"] as const;

export type AppTab = (typeof APP_TABS)[number];

export function isAppTab(value: string | null | undefined): value is AppTab {
  return value === "schedule" || value === "account";
}

export function tabFromSearchParam(
  raw: string | string[] | undefined,
): AppTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  // Legacy place / activities → Today (place is expand-on-page)
  if (v === "place" || v === "activities") return "schedule";
  return isAppTab(v) ? v : "schedule";
}
