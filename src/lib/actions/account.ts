"use server";

import bcrypt from "bcryptjs";
import { and, eq, ne, sql } from "drizzle-orm";
import { revalidateApp } from "@/lib/revalidate-app";
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
import { usernameSchema } from "@/lib/username";

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

  await db
    .update(users)
    .set({
      displayName,
      name: displayName,
    })
    .where(eq(users.id, userId));

  revalidateApp();

  return { success: "Display name updated." };
}

export async function updateUsernameAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId();
  const ip = await getClientIp();

  const limit = await consumeRateLimit(
    `username-change:ip:${ip}`,
    AUTH_RATE.emailChange.limit,
    AUTH_RATE.emailChange.windowMs,
  );
  if (!limit.ok) {
    return {
      error: `Too many username change attempts. Try again in ${limit.retryAfterSec}s.`,
    };
  }

  const usernameParsed = usernameSchema.safeParse(formData.get("username"));
  if (!usernameParsed.success) {
    return {
      error: usernameParsed.error.issues[0]?.message ?? "Invalid username",
    };
  }
  const username = usernameParsed.data;

  const currentPassword = String(formData.get("currentPassword") ?? "");
  if (!currentPassword) {
    return { error: "Enter your current password" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const valid = await bcrypt.compare(currentPassword, hash);

  if (!user?.passwordHash || !valid) {
    return { error: "Current password is incorrect." };
  }

  if (username === user.username) {
    return { error: "That is already your username." };
  }

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, username), ne(users.id, userId)))
    .limit(1);

  if (taken) {
    return { error: "That username is already taken." };
  }

  await db
    .update(users)
    .set({ username })
    .where(eq(users.id, userId));

  revalidateApp();

  return { success: "Username updated. Use it next time you sign in." };
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
