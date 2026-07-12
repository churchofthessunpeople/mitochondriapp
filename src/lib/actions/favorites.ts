"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { protocols, userFavorites, userScheduleItems } from "@/db/schema";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function revalidateAvailable() {
  revalidatePath("/app");
  revalidatePath("/activities");
  revalidatePath("/schedule");
  revalidatePath("/place");
  revalidatePath("/onboarding");
  revalidatePath("/today");
}

/**
 * Toggle whether a protocol is available for this user ("via" list).
 * Stored in user_favorites. Removing also drops it from the schedule.
 */
export async function toggleFavoriteAction(protocolId: string) {
  const userId = await requireUserId();

  const [protocol] = await db
    .select({ id: protocols.id })
    .from(protocols)
    .where(and(eq(protocols.id, protocolId), eq(protocols.active, true)))
    .limit(1);
  if (!protocol) throw new Error("Activity not found");

  const [existing] = await db
    .select()
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.protocolId, protocolId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.protocolId, protocolId),
        ),
      );
    // Can't schedule what you don't have
    await db
      .delete(userScheduleItems)
      .where(
        and(
          eq(userScheduleItems.userId, userId),
          eq(userScheduleItems.protocolId, protocolId),
        ),
      );
  } else {
    await db.insert(userFavorites).values({ userId, protocolId });
  }

  revalidateAvailable();
  return { favorited: !existing };
}
