"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { protocols, userFavorites } from "@/db/schema";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

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
  } else {
    await db.insert(userFavorites).values({ userId, protocolId });
  }

  revalidatePath("/today");
  return { favorited: !existing };
}
