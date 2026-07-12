import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  protocols,
  userScheduleItems,
  type Protocol,
  type TimeOfDay,
} from "@/db/schema";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";

export { canAssignToSlot } from "@/lib/schedule-rules";

export type ScheduleEntry = {
  scheduleId: string;
  timeOfDay: TimeOfDay;
  sortOrder: number;
  protocol: Protocol;
};

/**
 * Previously auto-seeded every catalog item into a new user's schedule.
 * Users now pick an available list, then build the schedule themselves.
 */
export async function ensureDefaultSchedule(_userId: string) {
  return;
}

export async function getUserSchedule(userId: string): Promise<ScheduleEntry[]> {
  const rows = await db
    .select({
      scheduleId: userScheduleItems.id,
      timeOfDay: userScheduleItems.timeOfDay,
      sortOrder: userScheduleItems.sortOrder,
      protocol: protocols,
    })
    .from(userScheduleItems)
    .innerJoin(protocols, eq(protocols.id, userScheduleItems.protocolId))
    .where(
      and(eq(userScheduleItems.userId, userId), eq(protocols.active, true)),
    )
    .orderBy(asc(userScheduleItems.sortOrder));

  return rows.map((r) => ({
    scheduleId: r.scheduleId,
    timeOfDay: r.timeOfDay,
    sortOrder: r.sortOrder,
    protocol: r.protocol,
  }));
}

export function groupScheduleByTime(entries: ScheduleEntry[]) {
  const map = new Map<TimeOfDay, ScheduleEntry[]>();
  for (const tod of TIME_OF_DAY_ORDER) map.set(tod, []);
  for (const e of entries) {
    map.get(e.timeOfDay)?.push(e);
  }
  return map;
}
