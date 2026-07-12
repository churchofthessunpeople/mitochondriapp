import { createHash } from "crypto";
import { z } from "zod";

const COMMON_PASSWORDS = new Set(
  [
    "password",
    "password123",
    "password1234",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty123",
    "qwertyuiop",
    "letmein",
    "welcome",
    "welcome1",
    "admin123",
    "iloveyou",
    "monkey123",
    "dragon123",
    "master123",
    "login1234",
    "abc12345",
    "passw0rd",
    "changeme",
    "changeme123",
    "mitochondria",
    "mitochondriapp",
  ].map((p) => p.toLowerCase()),
);

/** Lightweight policy: e.g. Hoger42@ is fine (8+, letter, number). */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[a-zA-Z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), {
    message: "That password is too common. Choose a stronger one.",
  });

export async function assertPasswordNotPwned(password: string): Promise<void> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "Mitochondriapp-PasswordCheck",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      // Fail open if HIBP is down so registration still works
      return;
    }

    const body = await res.text();
    const hit = body.split(/\r?\n/).some((line) => {
      const [hashSuffix] = line.split(":");
      return hashSuffix?.toUpperCase() === suffix;
    });

    if (hit) {
      throw new Error(
        "This password appears in known data breaches. Choose a different one.",
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("data breaches")) {
      throw error;
    }
    // Network / abort: fail open
  } finally {
    clearTimeout(timer);
  }
}

export async function validateNewPassword(
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid password",
    };
  }

  try {
    await assertPasswordNotPwned(password);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Password failed security checks",
    };
  }

  return { ok: true };
}
