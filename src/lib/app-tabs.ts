/**
 * Bottom nav: Today · Mitoversity · Account.
 * Deep links like ?t=leaderboard open Today with that section.
 * ?t=mitoversity opens the learn tab.
 */
export const APP_TABS = ["schedule", "mitoversity", "account"] as const;

export type AppTab = (typeof APP_TABS)[number];

export type TodaySection = "checklist" | "place" | "leaderboard" | "catalog";

export type AccountSection = "history" | "reminders" | "profile" | null;

export function isAppTab(value: string | null | undefined): value is AppTab {
  return (
    value === "schedule" || value === "mitoversity" || value === "account"
  );
}

export function isTodaySection(
  value: string | null | undefined,
): value is TodaySection {
  return (
    value === "checklist" ||
    value === "place" ||
    value === "catalog" ||
    value === "leaderboard" ||
    value === "activities"
  );
}

export function isAccountSection(
  value: string | null | undefined,
): value is NonNullable<AccountSection> {
  return value === "history" || value === "reminders" || value === "profile";
}

export function tabFromSearchParam(
  raw: string | string[] | undefined,
): AppTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (
    v === "place" ||
    v === "activities" ||
    v === "catalog" ||
    v === "leaderboard" ||
    v === "today"
  ) {
    return "schedule";
  }
  // Legacy alias
  if (
    v === "learn" ||
    v === "mitoversity" ||
    v === "kruseiversity" ||
    v === "kruse" ||
    v === "university"
  ) {
    return "mitoversity";
  }
  if (isAccountSection(v)) return "account";
  return isAppTab(v) ? v : "schedule";
}

/** Which Today section to open when landing via deep link */
export function todaySectionFromSearchParam(
  raw: string | string[] | undefined,
): TodaySection | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "leaderboard") return "leaderboard";
  if (v === "place") return "place";
  // Legacy catalog/activities deep links open the checklist (Edit activities lives there)
  if (v === "catalog" || v === "activities") return "checklist";
  return null;
}

/** Which Account card to open when landing via deep link */
export function accountSectionFromSearchParam(
  raw: string | string[] | undefined,
): AccountSection {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (isAccountSection(v) && v !== "profile") return v;
  return null;
}

/** Optional lesson to expand on Mitoversity deep link ?lesson=sunrise-why */
export function mitoLessonFromSearchParam(
  raw: string | string[] | undefined,
): string | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && typeof v === "string" && v.length > 0 ? v : null;
}
