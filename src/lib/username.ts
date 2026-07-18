import { z } from "zod";

/** 3–24 chars: letters, numbers, underscore. Stored lowercase. */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username must be at most 24 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Username must start with a letter and use only letters, numbers, and underscores",
  )
  .transform((value) => value.toLowerCase());

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

/** New usernames must be at least this dissimilar from every existing one (0–1). */
export const USERNAME_MIN_DISSIMILARITY = 0.75;

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + cost,
      );
    }
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j]!;
  }
  return prev[b.length]!;
}

/** 0 = completely different, 1 = identical. */
export function usernameSimilarity(a: string, b: string): number {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x === y) return 1;
  const maxLen = Math.max(x.length, y.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(x, y) / maxLen;
}

export function usernameDissimilarity(a: string, b: string): number {
  return 1 - usernameSimilarity(a, b);
}

/**
 * Error if candidate is already taken or too similar to an existing username.
 * `existing` should be lowercase usernames (excluding the current user on rename).
 */
export function usernameConflictMessage(
  candidate: string,
  existing: readonly string[],
): string | null {
  const c = candidate.toLowerCase();
  const maxSimilarity = 1 - USERNAME_MIN_DISSIMILARITY;

  for (const other of existing) {
    const o = other.toLowerCase();
    if (o === c) {
      return "That username is taken. Choose another that is at least 75% different from existing usernames.";
    }
  }

  for (const other of existing) {
    if (usernameSimilarity(c, other) > maxSimilarity) {
      return "That username is too similar to an existing one. Choose another that is at least 75% different.";
    }
  }

  return null;
}
