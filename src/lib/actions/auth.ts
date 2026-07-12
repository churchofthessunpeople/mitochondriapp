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
  type EmailDebug,
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
  /** Always prefer showing this after signup so testing isn't blocked */
  verifyUrl?: string;
  needsVerification?: boolean;
  emailDebug?: EmailDebug;
  messageId?: string;
};

function emailResultToState(
  sent: Awaited<ReturnType<typeof sendVerificationEmail>>,
  successMessage: string,
): AuthFormState {
  if (!sent.ok) {
    return {
      error: sent.message,
      needsVerification: true,
      verifyUrl: sent.verifyUrl,
      emailDebug: sent.debug,
    };
  }

  const via =
    sent.mode === "resend"
      ? "We attempted to email you a verification link."
      : "Email provider is not configured — use the link below.";

  return {
    success: `${successMessage} ${via}`,
    needsVerification: true,
    verifyUrl: sent.verifyUrl,
    emailDebug: sent.debug,
    messageId: sent.messageId,
  };
}

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

    if (existing?.emailVerified) {
      return {
        error:
          "An account with this email already exists and is verified. Sign in instead.",
      };
    }

    if (existing && !existing.emailVerified) {
      // Update password if they re-register while unverified
      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      const displayName = parsed.data.name.trim();
      await db
        .update(users)
        .set({
          passwordHash,
          name: displayName,
          displayName,
        })
        .where(eq(users.id, existing.id));

      const { raw } = await createEmailVerificationToken(email);
      const sent = await sendVerificationEmail(email, raw);
      return emailResultToState(
        sent,
        "Account already pending verification.",
      );
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
    return emailResultToState(sent, "Account created.");
  } catch (error) {
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
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

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
      const { raw } = await createEmailVerificationToken(email);
      const sent = await sendVerificationEmail(email, raw);
      return {
        error: sent.ok
          ? "Your email is not verified yet. We sent another link — check inbox or use the link below."
          : `Your email is not verified. ${sent.message}`,
        needsVerification: true,
        verifyUrl: sent.verifyUrl,
        emailDebug: sent.debug,
        messageId: sent.ok ? sent.messageId : undefined,
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
  try {
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

    if (!user) {
      return {
        error: "No account found for that email. Create an account first.",
      };
    }

    if (user.emailVerified) {
      return {
        success: "This email is already verified. You can sign in.",
      };
    }

    const { raw } = await createEmailVerificationToken(email);
    const sent = await sendVerificationEmail(email, raw);
    return emailResultToState(sent, "Verification email requested.");
  } catch (error) {
    console.error("[resendVerificationAction]", error);
    return {
      error:
        error instanceof Error
          ? `Resend failed: ${error.message}`
          : "Could not resend verification email.",
    };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
