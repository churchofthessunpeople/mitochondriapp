import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, users } from "@/db/schema";
import { getCatalogProtocolById } from "@/lib/catalog";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [row] = await db
    .select({ isGuest: users.isGuest })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (row?.isGuest) {
    return new Response("Save an account to export history", { status: 403 });
  }

  const rows = await db
    .select({
      date: dailyCompletions.completedOn,
      protocolId: dailyCompletions.protocolId,
      points: dailyCompletions.pointsEarned,
      durationMinutes: dailyCompletions.durationMinutes,
      timeOfDay: dailyCompletions.timeOfDay,
      isStreakBonus: dailyCompletions.isStreakBonus,
      createdAt: dailyCompletions.createdAt,
    })
    .from(dailyCompletions)
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
    ...rows.map((r) => {
      const name =
        getCatalogProtocolById(r.protocolId)?.name ??
        (r.isStreakBonus ? "streak_bonus" : r.protocolId);
      return [
        r.date,
        r.protocolId,
        csvEscape(name),
        r.points,
        r.durationMinutes ?? "",
        r.timeOfDay ?? "",
        r.isStreakBonus,
        r.createdAt?.toISOString?.() ?? "",
      ].join(",");
    }),
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
