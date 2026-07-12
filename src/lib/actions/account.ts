"use server";

import bcrypt from "bcryptjs";
import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/lib/email";
import { isEmailVerificationEnabled } from "@/lib/email-verification";
import { DUMMY_PASSWORD_HASH } from "@/lib/dummy-password-hash";
import { validateNewPassword } from "@/lib/password";
import {
  AUTH_RATE,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

export type AccountFormState = {
  error?: string;
  success?: string;
  devVerifyUrl?: string;
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

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  currentPassword: z.string().min(1, "Enter your current password").max(128),
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

  revalidatePath("/account");
  revalidatePath("/leaderboard");
  revalidatePath("/today");

  return { success: "Display name updated." };
}

export async function updateEmailAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId();
  const ip = await getClientIp();

  const limit = await consumeRateLimit(
    `email-change:ip:${ip}`,
    AUTH_RATE.emailChange.limit,
    AUTH_RATE.emailChange.windowMs,
  );
  if (!limit.ok) {
    return {
      error: `Too many email change attempts. Try again in ${limit.retryAfterSec}s.`,
    };
  }

  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase().trim();

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

  if (email === user.email) {
    return { error: "That is already your email." };
  }

  const [taken] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, userId)))
    .limit(1);

  if (taken) {
    return { error: "That email is already in use." };
  }

  if (!isEmailVerificationEnabled()) {
    await db
      .update(users)
      .set({
        email,
        emailVerified: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/account");
    return { success: "Email updated." };
  }

  // Require re-verification of the new address before it becomes active for login
  await db
    .update(users)
    .set({
      email,
      emailVerified: null,
      sessionVersion: sql`${users.sessionVersion} + 1`,
    })
    .where(eq(users.id, userId));

  const { raw } = await createEmailVerificationToken(email);
  const sent = await sendVerificationEmail(email, raw);

  if (!sent.ok) {
    return { error: sent.message };
  }

  await signOut({ redirectTo: "/login?verify=1" });
  return { success: "Email updated." };
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

  revalidatePath("/account");

  // Force re-login so only the new password + fresh JWT is valid
  await signOut({ redirectTo: "/login?passwordUpdated=1" });

  return { success: "Password updated. Please sign in again." };
}
