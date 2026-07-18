"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { AuthError, CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { generateStrongPassword } from "@/lib/generate-password";
import { validateNewPassword } from "@/lib/password";
import {
  AUTH_RATE,
  consumeRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { revalidateApp } from "@/lib/revalidate-app";
import { ROUTES } from "@/lib/routes";
import { getDisplayNameConflictError } from "@/lib/display-name-availability";
import { getUsernameConflictError } from "@/lib/username-availability";
import { usernameSchema } from "@/lib/username";

/**
 * Auth.js signIn/signOut with redirectTo can absolute-ize using AUTH_URL
 * (often localhost from local .env). Prefer redirect:false + Next redirect()
 * so the browser stays on the current host (prod domain).
 */
function isAuthRedirectError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

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

    const usernameConflict = await getUsernameConflictError(username);
    if (usernameConflict) {
      return { error: usernameConflict };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const chosenDisplay = parsed.data.displayName?.trim() || null;

    if (chosenDisplay) {
      const displayConflict = await getDisplayNameConflictError(chosenDisplay);
      if (displayConflict) {
        return { error: displayConflict };
      }
    }

    await db.insert(users).values({
      username,
      email: null,
      name: chosenDisplay ?? username,
      displayName: chosenDisplay,
      displayNameChangedAt: chosenDisplay ? new Date() : null,
      passwordHash,
      emailVerified: new Date(),
      sessionVersion: 0,
      onboardingComplete: false,
      tutorialComplete: false,
      isGuest: false,
    });

    try {
      const result = await signIn("credentials", {
        username,
        password: parsed.data.password,
        redirect: false,
      });
      if (result?.error) {
        return {
          success: "Account created. You can sign in now.",
        };
      }
    } catch (error) {
      if (isAuthRedirectError(error)) throw error;
      return { success: "Account created. You can sign in now." };
    }

    redirect(ROUTES.home);
  } catch (error) {
    if (isAuthRedirectError(error)) throw error;
    console.error("[registerAction]", error);
    return { error: "Registration failed. Please try again." };
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
    const result = await signIn("credentials", {
      username,
      password: parsed.data.password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Invalid username or password" };
    }
  } catch (error) {
    if (isAuthRedirectError(error)) throw error;

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

  redirect(ROUTES.home);
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
  await signOut({ redirect: false });
  redirect("/");
}

function guestUsername(): string {
  const buf = new Uint8Array(4);
  crypto.getRandomValues(buf);
  const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  return `guest_${hex}`;
}

/** Create an anonymous guest session and send them through onboarding. */
export async function startGuestAction(): Promise<void> {
  const session = await auth();
  if (session?.user?.id) {
    redirect(ROUTES.home);
  }

  const ip = await getClientIp();
  const ipLimit = await consumeRateLimit(
    `guest:ip:${ip}`,
    AUTH_RATE.guest.limit,
    AUTH_RATE.guest.windowMs,
  );
  if (!ipLimit.ok) {
    redirect(`${ROUTES.login}?guestError=rate`);
  }

  let username = guestUsername();
  for (let attempt = 0; attempt < 8; attempt++) {
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (!taken) break;
    username = guestUsername();
  }

  const password = generateStrongPassword(20);
  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    username,
    email: null,
    name: "Guest",
    displayName: null,
    passwordHash,
    emailVerified: new Date(),
    sessionVersion: 0,
    onboardingComplete: false,
    tutorialComplete: false,
    isGuest: true,
    showOnLeaderboard: false,
  });

  try {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (result?.error) {
      redirect(`${ROUTES.login}?guestError=1`);
    }
  } catch (error) {
    if (isAuthRedirectError(error)) throw error;
    redirect(`${ROUTES.login}?guestError=1`);
  }

  redirect(ROUTES.onboarding);
}

export type ConvertGuestState = {
  error?: string;
  success?: string;
};

const convertGuestSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().max(40).optional(),
  password: z.string().min(1).max(128),
  confirmPassword: z.string().min(1).max(128),
});

/** Turn a guest row into a real account (same userId — progress kept). */
export async function convertGuestAction(
  _prev: ConvertGuestState,
  formData: FormData,
): Promise<ConvertGuestState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  const [existing] = await db
    .select({
      id: users.id,
      isGuest: users.isGuest,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing?.isGuest) {
    return { error: "This account is already registered." };
  }

  const parsed = convertGuestSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName") || undefined,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const usernameParsed = usernameSchema.safeParse(parsed.data.username);
  if (!usernameParsed.success) {
    return {
      error: usernameParsed.error.issues[0]?.message ?? "Invalid username",
    };
  }
  const username = usernameParsed.data;

  if (username.startsWith("guest_")) {
    return { error: "Choose a username that does not start with guest_." };
  }

  const passwordCheck = await validateNewPassword(parsed.data.password);
  if (!passwordCheck.ok) {
    return { error: passwordCheck.message };
  }

  const usernameConflict = await getUsernameConflictError(username, {
    excludeUserId: userId,
  });
  if (usernameConflict) {
    return { error: usernameConflict };
  }

  const chosenDisplay = parsed.data.displayName?.trim() || null;
  if (chosenDisplay) {
    const displayConflict = await getDisplayNameConflictError(chosenDisplay, {
      excludeUserId: userId,
    });
    if (displayConflict) {
      return { error: displayConflict };
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db
    .update(users)
    .set({
      username,
      passwordHash,
      displayName: chosenDisplay,
      name: chosenDisplay ?? username,
      displayNameChangedAt: chosenDisplay ? new Date() : null,
      isGuest: false,
      showOnLeaderboard: true,
      sessionVersion: sql`${users.sessionVersion} + 1`,
    })
    .where(eq(users.id, userId));

  try {
    await signOut({ redirect: false });
    const result = await signIn("credentials", {
      username,
      password: parsed.data.password,
      redirect: false,
    });
    if (result?.error) {
      return {
        success:
          "Account saved. Sign in with your new username and password.",
      };
    }
  } catch (error) {
    if (isAuthRedirectError(error)) throw error;
    return {
      success: "Account saved. Sign in with your new username and password.",
    };
  }

  revalidateApp();
  redirect(ROUTES.home);
}

export async function markTutorialCompleteAction(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ tutorialComplete: true })
    .where(eq(users.id, session.user.id));

  revalidateApp();
}
