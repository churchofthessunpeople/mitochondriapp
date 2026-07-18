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
  /** Inclusive start (Sunday) */
  start: string;
  /** Exclusive end (following Sunday) — use `completedOn < endExclusive` */
  endExclusive: string;
  label: string;
};

/**
 * Previous complete week in the user's timezone: Sunday through Saturday,
 * labeled Sun–Sun (closing Sunday is the day after the last logged day).
 */
export function getPreviousWeekRange(
  timeZone: string,
  referenceToday?: string,
): WeekRange {
  const today = referenceToday ?? getTodayIsoForTimezone(timeZone);
  const dow = weekdayIndexInTimezone(today, timeZone);

  const thisWeekSunday = addIsoDays(today, -dow);
  const start = addIsoDays(thisWeekSunday, -7);
  const endExclusive = addIsoDays(start, 7);

  const startLabel = format(parseISO(start), "EEEE, MMMM d");
  const endLabel = format(parseISO(endExclusive), "EEEE, MMMM d, yyyy");

  return {
    start,
    endExclusive,
    label: `${startLabel} – ${endLabel}`,
  };
}
