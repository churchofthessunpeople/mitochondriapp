import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  protocols,
  userScheduleItems,
  type Protocol,
  type TimeOfDay,
} from "@/db/schema";
import { PROTOCOL_SEEDS } from "@/db/seed-data";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";

export { canAssignToSlot } from "@/lib/schedule-rules";

export type ScheduleEntry = {
  scheduleId: string;
  timeOfDay: TimeOfDay;
  sortOrder: number;
  protocol: Protocol;
};

/** Seed a new user's schedule from catalog defaults. */
export async function ensureDefaultSchedule(userId: string) {
  const existing = await db
    .select({ id: userScheduleItems.id })
    .from(userScheduleItems)
    .where(eq(userScheduleItems.userId, userId))
    .limit(1);

  if (existing.length > 0) return;

  let catalog = await db
    .select()
    .from(protocols)
    .where(eq(protocols.active, true))
    .orderBy(asc(protocols.sortOrder));

  if (catalog.length === 0) {
    // Fallback: use seed list shapes if DB empty (shouldn't happen after seed)
    catalog = PROTOCOL_SEEDS.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      points: s.points,
      timeOfDay: s.timeOfDay,
      lockedTimeOfDay: s.lockedTimeOfDay,
      allowsMultiple: s.allowsMultiple,
      sortOrder: s.sortOrder,
      active: true,
      createdAt: new Date(),
    }));
  }

  const rows = catalog.map((p, index) => ({
    userId,
    protocolId: p.id,
    timeOfDay: (p.lockedTimeOfDay ?? p.timeOfDay) as TimeOfDay,
    sortOrder: p.sortOrder ?? index,
  }));

  if (rows.length > 0) {
    await db.insert(userScheduleItems).values(rows).onConflictDoNothing();
  }
}

export async function getUserSchedule(userId: string): Promise<ScheduleEntry[]> {
  await ensureDefaultSchedule(userId);

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
