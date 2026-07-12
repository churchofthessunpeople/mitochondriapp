/**
 * All in-app surfaces live under /app?t=…
 * Bottom nav only shows Today + Account; other tabs open from Account chips.
 */
export const APP_TABS = [
  "schedule",
  "account",
  "history",
  "leaderboard",
  "friends",
  "reminders",
] as const;

export type AppTab = (typeof APP_TABS)[number];

export function isAppTab(value: string | null | undefined): value is AppTab {
  return (APP_TABS as readonly string[]).includes(value ?? "");
}

/** Tabs that highlight “Account” in the bottom nav */
export function isAccountArea(tab: AppTab): boolean {
  return (
    tab === "account" ||
    tab === "history" ||
    tab === "leaderboard" ||
    tab === "friends" ||
    tab === "reminders"
  );
}

export function tabFromSearchParam(
  raw: string | string[] | undefined,
): AppTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "place" || v === "activities") return "schedule";
  return isAppTab(v) ? v : "schedule";
}
