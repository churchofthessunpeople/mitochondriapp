"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols } from "@/db/schema";
import { getServerTodayIsoDate } from "@/lib/date-server";

/**
 * Toggle a protocol for *today only*. Client-supplied dates are ignored.
 */
export async function toggleCompletionAction(protocolId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const completedOn = await getServerTodayIsoDate();
  const userId = session.user.id;

  if (
    typeof protocolId !== "string" ||
    protocolId.length < 1 ||
    protocolId.length > 80
  ) {
    throw new Error("Invalid protocol");
  }

  const [protocol] = await db
    .select()
    .from(protocols)
    .where(and(eq(protocols.id, protocolId), eq(protocols.active, true)))
    .limit(1);

  if (!protocol) {
    throw new Error("Protocol not found");
  }

  const [existing] = await db
    .select()
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.protocolId, protocolId),
        eq(dailyCompletions.completedOn, completedOn),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.id, existing.id),
          eq(dailyCompletions.userId, userId),
        ),
      );
  } else {
    await db.insert(dailyCompletions).values({
      userId,
      protocolId,
      completedOn,
      pointsEarned: protocol.points,
    });
  }

  revalidatePath("/today");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
  revalidatePath("/");
}
