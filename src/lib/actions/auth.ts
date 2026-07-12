"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError, CredentialsSignin } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { validateNewPassword } from "@/lib/password";
import {
  AUTH_RATE,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { usernameSchema } from "@/lib/username";

const registerSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().max(40).optional(),
  password: z.string().min(1).max(128),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1).max(128),
});

export type AuthFormState = {
  error?: string;
  success?: string;
  verifyUrl?: string;
  needsVerification?: boolean;
  messageId?: string;
};

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const ip = await getClientIp();
    const ipLimit = await consumeRateLimit(
      `register:ip:${ip}`,
      AUTH_RATE.register.limit,
      AUTH_RATE.register.windowMs,
    );
    if (!ipLimit.ok) {
      return {
        error: `Too many registration attempts. Try again in ${ipLimit.retryAfterSec}s.`,
      };
    }

    const parsed = registerSchema.safeParse({
      username: formData.get("username"),
      displayName: formData.get("displayName") || undefined,
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const usernameParsed = usernameSchema.safeParse(parsed.data.username);
    if (!usernameParsed.success) {
      return {
        error: usernameParsed.error.issues[0]?.message ?? "Invalid username",
      };
    }
    const username = usernameParsed.data;

    const passwordCheck = await validateNewPassword(parsed.data.password);
    if (!passwordCheck.ok) {
      return { error: passwordCheck.message };
    }

    const userLimit = await consumeRateLimit(
      `register:user:${username}`,
      AUTH_RATE.register.limit,
      AUTH_RATE.register.windowMs,
    );
    if (!userLimit.ok) {
      return {
        error: `Too many registration attempts. Try again in ${userLimit.retryAfterSec}s.`,
      };
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing) {
      return {
        error: "That username is taken. Try another or sign in.",
      };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const displayName =
      parsed.data.displayName?.trim() ||
      username;

    await db.insert(users).values({
      username,
      email: null,
      name: displayName,
      displayName,
      passwordHash,
      emailVerified: new Date(),
      sessionVersion: 0,
      onboardingComplete: false,
    });

    try {
      await signIn("credentials", {
        username,
        password: parsed.data.password,
        redirectTo: "/schedule",
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof (error as { digest?: string }).digest === "string" &&
        (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      return { success: "Account created. You can sign in now." };
    }

    return { success: "Account created." };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.error("[registerAction]", error);
    return {
      error:
        error instanceof Error
          ? `Registration failed: ${error.message}`
          : "Registration failed. Check server logs.",
    };
  }
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a username and password" };
  }

  const username = parsed.data.username.trim().toLowerCase();

  const ipLimit = await consumeRateLimit(
    `login:ip:${ip}`,
    AUTH_RATE.login.limit,
    AUTH_RATE.login.windowMs,
  );
  if (!ipLimit.ok) {
    return {
      error: `Too many sign-in attempts. Try again in ${ipLimit.retryAfterSec}s.`,
    };
  }

  const userLimit = await consumeRateLimit(
    `login:user:${username}`,
    AUTH_RATE.login.limit,
    AUTH_RATE.login.windowMs,
  );
  if (!userLimit.ok) {
    return {
      error: `Too many sign-in attempts. Try again in ${userLimit.retryAfterSec}s.`,
    };
  }

  try {
    await signIn("credentials", {
      username,
      password: parsed.data.password,
      redirectTo: "/schedule",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (
      error instanceof AuthError ||
      error instanceof CredentialsSignin ||
      (error instanceof Error &&
        (error.name === "CredentialsSignin" ||
          error.message.includes("CredentialsSignin")))
    ) {
      return { error: "Invalid username or password" };
    }

    throw error;
  }

  return { success: "Signed in" };
}

/** Kept for old UI; no-ops while verification is off / username-only. */
export async function resendVerificationAction(
  _prev: AuthFormState,
  _formData: FormData,
): Promise<AuthFormState> {
  return {
    success: "Email verification is not required. Sign in with your username.",
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
