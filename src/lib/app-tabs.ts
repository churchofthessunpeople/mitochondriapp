export const APP_TABS = [
  "schedule",
  "place",
  "activities",
  "account",
] as const;

export type AppTab = (typeof APP_TABS)[number];

export function isAppTab(value: string | null | undefined): value is AppTab {
  return (
    value === "schedule" ||
    value === "place" ||
    value === "activities" ||
    value === "account"
  );
}

export function tabFromSearchParam(
  raw: string | string[] | undefined,
): AppTab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return isAppTab(v) ? v : "schedule";
}
