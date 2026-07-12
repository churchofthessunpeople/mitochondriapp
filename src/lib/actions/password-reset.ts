"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { getAppBaseUrl } from "@/lib/email";
import { validateNewPassword } from "@/lib/password";
import { AUTH_RATE, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export type ResetFormState = { error?: string; success?: string };

export async function requestPasswordResetAction(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const ip = await getClientIp();
  const limit = await consumeRateLimit(
    `pw-reset:${ip}`,
    5,
    AUTH_RATE.login.windowMs,
  );
  if (!limit.ok) {
    return { error: `Too many attempts. Try in ${limit.retryAfterSec}s.` };
  }

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!username || !z.string().email().safeParse(email).success) {
    return { error: "Enter username and the recovery email on the account." };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const generic =
    "If that account has a matching recovery email, we sent a reset link.";

  if (!user?.email || user.email.toLowerCase() !== email || !user.passwordHash) {
    return { success: generic };
  }

  const raw = randomBytes(32).toString("base64url");
  const token = hashToken(raw);
  const identifier = `pw-reset:${user.id}`;
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({ identifier, token, expires });

  const url = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(raw)}&uid=${encodeURIComponent(user.id)}`;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const from =
      process.env.EMAIL_FROM?.trim() ||
      "Mitochondriapp <onboarding@resend.dev>";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your Mitochondriapp password",
        text: `Reset link (1 hour): ${url}`,
        html: `<p><a href="${url}">Reset your password</a> (expires in 1 hour).</p>`,
      }),
    });
    return { success: generic };
  }

  console.info("[password-reset]", url);
  return { success: `${generic} Dev link: ${url}` };
}

export async function resetPasswordAction(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const uid = String(formData.get("uid") ?? "");
  const raw = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const check = await validateNewPassword(password);
  if (!check.ok) return { error: check.message };

  const identifier = `pw-reset:${uid}`;
  const token = hashToken(raw);
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, token),
      ),
    )
    .limit(1);

  if (!row || row.expires < new Date()) {
    return { error: "Reset link invalid or expired." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .update(users)
    .set({
      passwordHash,
      sessionVersion: sql`${users.sessionVersion} + 1`,
    })
    .where(eq(users.id, uid));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));

  return { success: "Password updated. You can sign in." };
}
