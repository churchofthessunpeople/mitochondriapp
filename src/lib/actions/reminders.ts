"use server";

import { and, eq } from "drizzle-orm";
import { revalidateApp } from "@/lib/revalidate-app";
import { auth } from "@/auth";
import { db } from "@/db";
import { userReminders } from "@/db/schema";

async function uid() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
  return s.user.id;
}

export async function saveReminderAction(label: string, localTime: string) {
  const userId = await uid();
  if (!/^\d{2}:\d{2}$/.test(localTime)) throw new Error("Invalid time");
  await db.insert(userReminders).values({
    userId,
    label: label.trim() || "Log protocols",
    localTime,
    enabled: true,
  });
  revalidateApp();
}

export async function deleteReminderAction(id: string) {
  const userId = await uid();
  await db
    .delete(userReminders)
    .where(and(eq(userReminders.id, id), eq(userReminders.userId, userId)));
  revalidateApp();
}
