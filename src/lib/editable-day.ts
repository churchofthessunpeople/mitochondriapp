import { format, parseISO } from "date-fns";
import { addIsoDays } from "@/lib/week-range";

/** How far back users may edit from calendar today (in their timezone). */
export const EDITABLE_DAY_LOOKBACK = 1;

export function yesterdayIsoFromToday(todayIso: string): string {
  return addIsoDays(todayIso, -EDITABLE_DAY_LOOKBACK);
}

/**
 * Clamp a requested calendar day to today or yesterday.
 * Invalid / out-of-range → today.
 */
export function resolveEditableCompletedOn(
  todayIso: string,
  requestedIso?: string | null,
): string {
  if (!requestedIso || !/^\d{4}-\d{2}-\d{2}$/.test(requestedIso)) {
    return todayIso;
  }
  const yesterday = yesterdayIsoFromToday(todayIso);
  if (requestedIso === yesterday) return yesterday;
  return todayIso;
}

export function isEditableYesterday(
  todayIso: string,
  viewDayIso: string,
): boolean {
  return viewDayIso === yesterdayIsoFromToday(todayIso);
}

/** Checklist header label for the active editable day. */
export function formatEditableDayLabel(
  viewDayIso: string,
  todayIso: string,
  todayLabel: string,
): string {
  if (viewDayIso === todayIso) return todayLabel;
  const formatted = format(parseISO(`${viewDayIso}T12:00:00`), "EEEE, MMM d");
  return `Yesterday · ${formatted}`;
}
