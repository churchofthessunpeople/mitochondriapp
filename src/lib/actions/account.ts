"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { revalidateApp } from "@/lib/revalidate-app";
import { updateTag } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { DUMMY_PASSWORD_HASH } from "@/lib/dummy-password-hash";
import { validateNewPassword } from "@/lib/password";
import {
  AUTH_RATE,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { ROUTES } from "@/lib/routes";
import { getDisplayNameConflictError } from "@/lib/display-name-availability";
import {
  displayNameChangeBlockedUntil,
  formatDisplayNameChangeRetry,
} from "@/lib/display-name-policy";

export type AccountFormState = {
  error?: string;
  success?: string;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(40, "Display name must be at most 40 characters"),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(128),
  newPassword: z.string().min(1).max(128),
  confirmPassword: z.string().min(1, "Confirm your new password").max(128),
});

export async function updateDisplayNameAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId();

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const displayName = parsed.data.displayName.trim();

  const [user] = await db
    .select({
      displayName: users.displayName,
      createdAt: users.createdAt,
      displayNameChangedAt: users.displayNameChangedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return { error: "Account not found." };
  }

  if (displayName === (user.displayName?.trim() ?? "")) {
    return { error: "That is already your display name." };
  }

  const blockedUntil = displayNameChangeBlockedUntil(user);
  if (blockedUntil) {
    return {
      error: `You can change your display name again on ${formatDisplayNameChangeRetry(blockedUntil)}.`,
    };
  }

  const nameConflict = await getDisplayNameConflictError(displayName, {
    excludeUserId: userId,
  });
  if (nameConflict) {
    return { error: nameConflict };
  }

  await db
    .update(users)
    .set({
      displayName,
      name: displayName,
      displayNameChangedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidateApp();
  updateTag("leaderboards");

  return { success: "Display name updated." };
}

export async function updateUsernameAction(
  _prev: AccountFormState,
  _formData: FormData,
): Promise<AccountFormState> {
  await requireUserId();
  return {
    error:
      "Usernames are permanent after signup. Update your display name instead, or contact support if you need help.",
  };
}

export async function updatePasswordAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId();
  const ip = await getClientIp();

  const limit = await consumeRateLimit(
    `password-change:ip:${ip}`,
    AUTH_RATE.passwordChange.limit,
    AUTH_RATE.passwordChange.windowMs,
  );
  if (!limit.ok) {
    return {
      error: `Too many password change attempts. Try again in ${limit.retryAfterSec}s.`,
    };
  }

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { error: "New passwords do not match" };
  }

  const passwordCheck = await validateNewPassword(parsed.data.newPassword);
  if (!passwordCheck.ok) {
    return { error: passwordCheck.message };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const valid = await bcrypt.compare(parsed.data.currentPassword, hash);

  if (!user?.passwordHash || !valid) {
    return { error: "Current password is incorrect." };
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { error: "New password must be different from the current one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash,
      sessionVersion: sql`${users.sessionVersion} + 1`,
    })
    .where(eq(users.id, userId));

  revalidateApp();

  await signOut({ redirect: false });
  redirect(`${ROUTES.login}?passwordUpdated=1`);
}
