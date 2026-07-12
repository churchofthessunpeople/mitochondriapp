import { createHash, randomBytes } from "crypto";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { verificationTokens } from "@/db/schema";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getAppBaseUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function createEmailVerificationToken(email: string) {
  const raw = randomBytes(32).toString("base64url");
  const token = hashToken(raw);
  const identifier = `email-verify:${email.toLowerCase()}`;
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  // Clear prior tokens for this identity
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));

  await db.insert(verificationTokens).values({
    identifier,
    token,
    expires,
  });

  return { raw, expires };
}

export async function consumeEmailVerificationToken(
  email: string,
  rawToken: string,
): Promise<boolean> {
  const identifier = `email-verify:${email.toLowerCase()}`;
  const token = hashToken(rawToken);
  const now = new Date();

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

  if (!row) return false;
  if (row.expires < now) {
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, token),
        ),
      );
    return false;
  }

  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, token),
      ),
    );

  // Housekeeping: drop expired tokens
  await db
    .delete(verificationTokens)
    .where(lt(verificationTokens.expires, now));

  return true;
}

export async function sendVerificationEmail(
  email: string,
  rawToken: string,
): Promise<{ ok: true; devUrl?: string } | { ok: false; message: string }> {
  const base = getAppBaseUrl();
  const url = `${base}/verify-email?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "Mitochondriapp <onboarding@resend.dev>";

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Verify your Mitochondriapp email",
        html: `
          <p>Welcome to Mitochondriapp.</p>
          <p><a href="${url}">Verify your email</a> to activate your account.</p>
          <p>This link expires in 24 hours.</p>
          <p>If you did not sign up, you can ignore this message.</p>
        `,
        text: `Verify your Mitochondriapp email: ${url}\n\nThis link expires in 24 hours.`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Resend error", res.status, detail);
      return {
        ok: false,
        message: "Could not send verification email. Try again later.",
      };
    }

    return { ok: true };
  }

  // Dev / unconfigured: expose link so local testing works
  console.info("[email] Verification link (RESEND_API_KEY not set):", url);

  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_VERIFY_URL) {
    return {
      ok: false,
      message:
        "Email delivery is not configured (RESEND_API_KEY). Contact the site admin.",
    };
  }

  return { ok: true, devUrl: url };
}
