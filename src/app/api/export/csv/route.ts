import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await db
    .select({
      date: dailyCompletions.completedOn,
      protocolId: dailyCompletions.protocolId,
      protocolName: protocols.name,
      points: dailyCompletions.pointsEarned,
      durationMinutes: dailyCompletions.durationMinutes,
      timeOfDay: dailyCompletions.timeOfDay,
      isStreakBonus: dailyCompletions.isStreakBonus,
      createdAt: dailyCompletions.createdAt,
    })
    .from(dailyCompletions)
    .leftJoin(protocols, eq(protocols.id, dailyCompletions.protocolId))
    .where(eq(dailyCompletions.userId, session.user.id))
    .orderBy(asc(dailyCompletions.completedOn));

  const header = [
    "date",
    "protocol_id",
    "protocol_name",
    "points",
    "duration_minutes",
    "time_of_day",
    "is_streak_bonus",
    "logged_at",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.date,
        r.protocolId,
        csvEscape(r.protocolName ?? (r.isStreakBonus ? "streak_bonus" : "")),
        r.points,
        r.durationMinutes ?? "",
        r.timeOfDay ?? "",
        r.isStreakBonus,
        r.createdAt?.toISOString?.() ?? "",
      ].join(","),
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mitochondriapp-export.csv"`,
    },
  });
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
