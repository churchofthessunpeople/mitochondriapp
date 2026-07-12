"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError, CredentialsSignin } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/lib/email";
import { DUMMY_PASSWORD_HASH } from "@/lib/dummy-password-hash";
import { validateNewPassword } from "@/lib/password";
import {
  AUTH_RATE,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Display name must be at least 2 characters").max(40),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export type AuthFormState = {
  error?: string;
  success?: string;
  devVerifyUrl?: string;
  needsVerification?: boolean;
};

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
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
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const passwordCheck = await validateNewPassword(parsed.data.password);
  if (!passwordCheck.ok) {
    return { error: passwordCheck.message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const emailLimit = await consumeRateLimit(
    `register:email:${email}`,
    AUTH_RATE.register.limit,
    AUTH_RATE.register.windowMs,
  );
  if (!emailLimit.ok) {
    return {
      error: `Too many registration attempts. Try again in ${emailLimit.retryAfterSec}s.`,
    };
  }

  const [existing] = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Generic response to avoid account enumeration
  const genericSuccess =
    "If this email can be used, we sent a verification link. Check your inbox.";

  if (existing) {
    if (!existing.emailVerified) {
      const { raw } = await createEmailVerificationToken(email);
      const sent = await sendVerificationEmail(email, raw);
      return {
        success: genericSuccess,
        needsVerification: true,
        devVerifyUrl: sent.ok ? sent.devUrl : undefined,
      };
    }
    return { success: genericSuccess, needsVerification: true };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const displayName = parsed.data.name.trim();

  await db.insert(users).values({
    email,
    name: displayName,
    displayName,
    passwordHash,
    emailVerified: null,
    sessionVersion: 0,
  });

  const { raw } = await createEmailVerificationToken(email);
  const sent = await sendVerificationEmail(email, raw);

  if (!sent.ok) {
    return { error: sent.message };
  }

  return {
    success: genericSuccess,
    needsVerification: true,
    devVerifyUrl: sent.devUrl,
  };
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password" };
  }

  const email = parsed.data.email.toLowerCase().trim();

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

  const emailLimit = await consumeRateLimit(
    `login:email:${email}`,
    AUTH_RATE.login.limit,
    AUTH_RATE.login.windowMs,
  );
  if (!emailLimit.ok) {
    return {
      error: `Too many sign-in attempts. Try again in ${emailLimit.retryAfterSec}s.`,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/today",
    });
  } catch (error) {
    // Successful sign-in throws NEXT_REDIRECT — rethrow non-auth errors of that type
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    // Distinguish unverified accounts (password must still match)
    const [user] = await db
      .select({
        passwordHash: users.passwordHash,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordOk = await bcrypt.compare(parsed.data.password, hash);

    if (user?.passwordHash && passwordOk && !user.emailVerified) {
      return {
        error:
          "Verify your email before signing in. Check your inbox for a link.",
        needsVerification: true,
      };
    }

    if (
      error instanceof AuthError ||
      error instanceof CredentialsSignin ||
      (error instanceof Error &&
        (error.name === "CredentialsSignin" ||
          error.message.includes("CredentialsSignin")))
    ) {
      return { error: "Invalid email or password" };
    }

    throw error;
  }

  return { success: "Signed in" };
}

export async function resendVerificationAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const ipLimit = await consumeRateLimit(
    `verify-resend:ip:${ip}`,
    AUTH_RATE.verifyResend.limit,
    AUTH_RATE.verifyResend.windowMs,
  );
  if (!ipLimit.ok) {
    return {
      error: `Too many resend attempts. Try again in ${ipLimit.retryAfterSec}s.`,
    };
  }

  const emailRaw = formData.get("email");
  const emailParsed = z.string().email().safeParse(emailRaw);
  if (!emailParsed.success) {
    return { error: "Enter a valid email" };
  }

  const email = emailParsed.data.toLowerCase().trim();
  const emailLimit = await consumeRateLimit(
    `verify-resend:email:${email}`,
    AUTH_RATE.verifyResend.limit,
    AUTH_RATE.verifyResend.windowMs,
  );
  if (!emailLimit.ok) {
    return {
      error: `Too many resend attempts. Try again in ${emailLimit.retryAfterSec}s.`,
    };
  }

  const [user] = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const generic =
    "If an unverified account exists for that email, we sent a new link.";

  if (!user || user.emailVerified) {
    return { success: generic };
  }

  const { raw } = await createEmailVerificationToken(email);
  const sent = await sendVerificationEmail(email, raw);

  if (!sent.ok) {
    return { error: sent.message };
  }

  return { success: generic, devVerifyUrl: sent.devUrl };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
