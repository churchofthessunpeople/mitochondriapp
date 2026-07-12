"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

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

  revalidatePath("/app");
  revalidatePath("/schedule");
  revalidatePath("/place");
  revalidatePath("/activities");
  revalidatePath("/onboarding");
  redirect("/app");
}

/** Mark complete without redirect (client-driven). */
export async function markOnboardingCompleteAction() {
  const userId = await requireUserId();
  await db
    .update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, userId));

  revalidatePath("/app");
  revalidatePath("/schedule");
  revalidatePath("/place");
  revalidatePath("/activities");
  revalidatePath("/onboarding");
  return { ok: true as const };
}
