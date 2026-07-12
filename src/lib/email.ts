import { createHash, randomBytes } from "crypto";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { verificationTokens } from "@/db/schema";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export type SendEmailResult =
  | {
      ok: true;
      verifyUrl: string;
      messageId?: string;
      mode: "resend" | "dev-link";
      debug: EmailDebug;
    }
  | {
      ok: false;
      message: string;
      verifyUrl: string;
      debug: EmailDebug;
    };

export type EmailDebug = {
  hasApiKey: boolean;
  from: string;
  to: string;
  baseUrl: string;
  resendStatus?: number;
  resendBody?: string;
  note?: string;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Absolute origin for email / reset links.
 * On Vercel, never prefer a localhost AUTH_URL left over from local .env.
 */
export function getAppBaseUrl() {
  const authUrl = process.env.AUTH_URL?.trim().replace(/\/$/, "") || "";
  const onVercel = Boolean(process.env.VERCEL);

  if (authUrl && !(onVercel && isLocalhostUrl(authUrl))) {
    return authUrl;
  }

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) {
    const host = prod.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  if (authUrl) return authUrl;
  return "http://localhost:3000";
}

function buildVerifyUrl(email: string, rawToken: string) {
  const base = getAppBaseUrl();
  return `${base}/verify-email?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;
}

export async function createEmailVerificationToken(email: string) {
  const raw = randomBytes(32).toString("base64url");
  const token = hashToken(raw);
  const identifier = `email-verify:${email.toLowerCase()}`;
  const expires = new Date(Date.now() + VERIFY_TTL_MS);

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));

  await db.insert(verificationTokens).values({
    identifier,
    token,
    expires,
  });

  return { raw, expires, verifyUrl: buildVerifyUrl(email, raw) };
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

  await db
    .delete(verificationTokens)
    .where(lt(verificationTokens.expires, now));

  return true;
}

function baseDebug(to: string): EmailDebug {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return {
    hasApiKey: Boolean(apiKey),
    from: (process.env.EMAIL_FROM || "Mitochondriapp <onboarding@resend.dev>").trim(),
    to,
    baseUrl: getAppBaseUrl(),
    note: apiKey
      ? undefined
      : "RESEND_API_KEY is missing in this environment",
  };
}

/**
 * Send verification email via Resend. Always returns a verifyUrl so the UI
 * can offer a fallback if delivery fails or is restricted.
 */
export async function sendVerificationEmail(
  email: string,
  rawToken: string,
): Promise<SendEmailResult> {
  const to = email.toLowerCase().trim();
  const verifyUrl = buildVerifyUrl(to, rawToken);
  const debug = baseDebug(to);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = debug.from;

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY missing. Verify URL:", verifyUrl);
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && process.env.ALLOW_DEV_VERIFY_URL !== "true") {
      return {
        ok: false,
        message:
          "Email is not configured: RESEND_API_KEY is missing on the server. Add it in Vercel env vars and redeploy.",
        verifyUrl,
        debug,
      };
    }
    return {
      ok: true,
      verifyUrl,
      mode: "dev-link",
      debug: {
        ...debug,
        note: "No API key — using on-screen verify link only",
      },
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Verify your Mitochondriapp email",
        html: `
          <p>Welcome to Mitochondriapp.</p>
          <p><a href="${verifyUrl}">Verify your email</a> to activate your account.</p>
          <p>This link expires in 24 hours.</p>
          <p>If you did not sign up, you can ignore this message.</p>
        `,
        text: `Verify your Mitochondriapp email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
      }),
    });

    const bodyText = await res.text().catch(() => "");
    let parsed: { id?: string; message?: string; name?: string } = {};
    try {
      parsed = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      parsed = {};
    }

    debug.resendStatus = res.status;
    debug.resendBody = bodyText.slice(0, 500);

    if (!res.ok) {
      const resendMessage =
        parsed.message ||
        bodyText.slice(0, 280) ||
        `Resend HTTP ${res.status}`;

      console.error("[email] Resend failed", {
        status: res.status,
        body: bodyText.slice(0, 500),
        to,
        from,
      });

      // Common Resend test-mode restriction — make it obvious
      const hint = resendMessage.toLowerCase().includes("own email")
        ? " With onboarding@resend.dev you can only send to the email on your Resend account."
        : "";

      return {
        ok: false,
        message: `Email failed: ${resendMessage}.${hint}`,
        verifyUrl,
        debug: {
          ...debug,
          note: "Resend rejected the send — use the fallback verify link below, or fix Resend config.",
        },
      };
    }

    console.info("[email] Resend accepted", {
      id: parsed.id,
      to,
      from,
    });

    return {
      ok: true,
      verifyUrl,
      messageId: parsed.id,
      mode: "resend",
      debug: {
        ...debug,
        note: parsed.id
          ? `Resend accepted message id ${parsed.id}`
          : "Resend accepted (no id in response)",
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown network error";
    console.error("[email] Resend network error", msg);
    return {
      ok: false,
      message: `Email request failed: ${msg}`,
      verifyUrl,
      debug: {
        ...debug,
        note: "Network/exception calling Resend",
      },
    };
  }
}
