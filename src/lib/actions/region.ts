"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { regions, users } from "@/db/schema";

export async function setUserRegionAction(regionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [region] = await db
    .select()
    .from(regions)
    .where(eq(regions.id, regionId))
    .limit(1);

  if (!region?.active) throw new Error("Region not found");

  await db
    .update(users)
    .set({
      regionId: region.id,
      timezone: region.timezone,
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/today");
  revalidatePath("/account");
  revalidatePath("/region");
}
