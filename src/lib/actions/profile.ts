"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

async function uid() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
  return s.user.id;
}

export async function updateRecoveryEmailAction(
  _p: { error?: string; success?: string },
  formData: FormData,
) {
  const userId = await uid();
  const raw = String(formData.get("email") ?? "").trim().toLowerCase();
  if (raw && !z.string().email().safeParse(raw).success) {
    return { error: "Invalid email" };
  }
  await db
    .update(users)
    .set({ email: raw || null })
    .where(eq(users.id, userId));
  revalidatePath("/account");
  return { success: raw ? "Recovery email saved." : "Recovery email cleared." };
}

export async function updateTimezoneAction(
  _p: { error?: string; success?: string },
  formData: FormData,
) {
  const userId = await uid();
  const tz = String(formData.get("timezone") ?? "UTC").trim() || "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
  } catch {
    return { error: "Invalid timezone" };
  }
  await db.update(users).set({ timezone: tz }).where(eq(users.id, userId));
  revalidatePath("/account");
  revalidatePath("/place");
  revalidatePath("/today");
  return { success: "Timezone updated." };
}

export async function updateLeaderboardVisibilityAction(show: boolean) {
  const userId = await uid();
  await db
    .update(users)
    .set({ showOnLeaderboard: show })
    .where(eq(users.id, userId));
  revalidatePath("/leaderboard");
  revalidatePath("/account");
}
