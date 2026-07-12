"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { revalidateApp } from "@/lib/revalidate-app";

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
  revalidateApp();
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
  revalidateApp();
  return { success: "Timezone updated." };
}

export async function updateLeaderboardVisibilityAction(show: boolean) {
  const userId = await uid();
  await db
    .update(users)
    .set({ showOnLeaderboard: show })
    .where(eq(users.id, userId));
  revalidateApp();
}

/** Form-friendly: flip current visibility. */
export async function toggleLeaderboardVisibilityFormAction() {
  const userId = await uid();
  const [row] = await db
    .select({ show: users.showOnLeaderboard })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  await updateLeaderboardVisibilityAction(!(row?.show ?? true));
}

export async function saveRecoveryEmailFormAction(formData: FormData) {
  await updateRecoveryEmailAction({}, formData);
}

export async function saveTimezoneFormAction(formData: FormData) {
  await updateTimezoneAction({}, formData);
}
