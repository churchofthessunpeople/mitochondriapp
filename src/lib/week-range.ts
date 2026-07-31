import { addDays, format, parseISO } from "date-fns";
import { getTodayIsoForTimezone } from "@/lib/date-tz";

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** Calendar day of week in a timezone (0 = Sunday). */
export function weekdayIndexInTimezone(isoDate: string, timeZone: string): number {
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "UTC",
    weekday: "long",
  }).format(parseISO(`${isoDate}T12:00:00`));
  return WEEKDAY_TO_INDEX[dayName] ?? 0;
}

export function addIsoDays(isoDate: string, days: number): string {
  return format(addDays(parseISO(`${isoDate}T12:00:00`), days), "yyyy-MM-dd");
}

export type WeekRange = {
  /** Inclusive start */
  start: string;
  /** Exclusive end — use `completedOn < endExclusive` */
  endExclusive: string;
  /** Inclusive last day (for labels) */
  endInclusive: string;
  label: string;
};

/**
 * Rolling previous 7 calendar days in the user's timezone, ending yesterday
 * (excludes today so the window is only completed days).
 */
export function getLastSevenDaysRange(
  timeZone: string,
  referenceToday?: string,
): WeekRange {
  const today = referenceToday ?? getTodayIsoForTimezone(timeZone);
  const endInclusive = addIsoDays(today, -1);
  const start = addIsoDays(endInclusive, -6);
  const endExclusive = today;

  const startLabel = format(parseISO(start), "EEEE, MMMM d");
  const endLabel = format(parseISO(endInclusive), "EEEE, MMMM d, yyyy");

  return {
    start,
    endExclusive,
    endInclusive,
    label: `${startLabel} – ${endLabel}`,
  };
}

/** @deprecated Prefer getLastSevenDaysRange — kept for older imports. */
export function getPreviousWeekRange(
  timeZone: string,
  referenceToday?: string,
): WeekRange {
  return getLastSevenDaysRange(timeZone, referenceToday);
}
