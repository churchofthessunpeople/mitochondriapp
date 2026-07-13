/**
 * Bottom nav: Today · Kruseiversity · Account.
 * Deep links like ?t=leaderboard open Account with that section.
 * ?t=kruseiversity opens the learn tab.
 */
export const APP_TABS = ["schedule", "kruseiversity", "account"] as const;

export type AppTab = (typeof APP_TABS)[number];

export type AccountSection =
  | "history"
  | "leaderboard"
  | "friends"
  | "reminders"
  | "profile"
  | null;

export function isAppTab(value: string | null | undefined): value is AppTab {
  return (
    value === "schedule" || value === "kruseiversity" || value === "account"
  );
}

export function isAccountSection(
  value: string | null | undefined,
): value is NonNullable<AccountSection> {
  return (
    value === "history" ||
    value === "leaderboard" ||
    value === "friends" ||
    value === "reminders" ||
    value === "profile"
  );
}

export function tabFromSearchParam(
  raw: string | string[] | undefined,
): AppTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "place" || v === "activities" || v === "today") return "schedule";
  if (v === "learn" || v === "kruse" || v === "university") {
    return "kruseiversity";
  }
  if (isAccountSection(v)) return "account";
  return isAppTab(v) ? v : "schedule";
}

/** Which Account card to open when landing via deep link */
export function accountSectionFromSearchParam(
  raw: string | string[] | undefined,
): AccountSection {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (isAccountSection(v) && v !== "profile") return v;
  return null;
}

/** Optional lesson to expand on Kruseiversity deep link ?lesson=sunrise-why */
export function kruseLessonFromSearchParam(
  raw: string | string[] | undefined,
): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && typeof v === "string" && v.length > 0 ? v : null;
}
