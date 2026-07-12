"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols } from "@/db/schema";
import { todayIsoDate } from "@/lib/utils";

export async function toggleCompletionAction(protocolId: string, date?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const completedOn = date ?? todayIsoDate();
  const userId = session.user.id;

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
      .where(eq(dailyCompletions.id, existing.id));
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

export async function completeProtocolAction(protocolId: string, date?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const completedOn = date ?? todayIsoDate();
  const userId = session.user.id;

  const [protocol] = await db
    .select()
    .from(protocols)
    .where(and(eq(protocols.id, protocolId), eq(protocols.active, true)))
    .limit(1);

  if (!protocol) {
    throw new Error("Protocol not found");
  }

  await db
    .insert(dailyCompletions)
    .values({
      userId,
      protocolId,
      completedOn,
      pointsEarned: protocol.points,
    })
    .onConflictDoNothing({
      target: [
        dailyCompletions.userId,
        dailyCompletions.protocolId,
        dailyCompletions.completedOn,
      ],
    });

  revalidatePath("/today");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
}

export async function uncompleteProtocolAction(
  protocolId: string,
  date?: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const completedOn = date ?? todayIsoDate();

  await db
    .delete(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, session.user.id),
        eq(dailyCompletions.protocolId, protocolId),
        eq(dailyCompletions.completedOn, completedOn),
      ),
    );

  revalidatePath("/today");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
}
