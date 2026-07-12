"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { revalidateApp } from "@/lib/revalidate-app";
import { ROUTES } from "@/lib/routes";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function completeOnboardingAction() {
  const userId = await requireUserId();
  await db
    .update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, userId));

  revalidateApp();
  redirect(ROUTES.home);
}

/** Mark complete without redirect (client-driven). */
export async function markOnboardingCompleteAction() {
  const userId = await requireUserId();
  await db
    .update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, userId));

  revalidateApp();
  return { ok: true as const };
}
