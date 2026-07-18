import { ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  isReservedUsername,
  listReservedUsernames,
} from "@/lib/reserved-usernames";
import { usernameConflictMessage } from "@/lib/username";

/**
 * Server-side uniqueness + 75% dissimilarity check against all usernames
 * (and reserved names).
 */
export async function getUsernameConflictError(
  candidate: string,
  options?: { excludeUserId?: string },
): Promise<string | null> {
  if (isReservedUsername(candidate)) {
    return "That username is not available.";
  }

  const rows = options?.excludeUserId
    ? await db
        .select({ username: users.username })
        .from(users)
        .where(ne(users.id, options.excludeUserId))
    : await db.select({ username: users.username }).from(users);

  const existing = [
    ...rows.map((r) => r.username),
    ...listReservedUsernames(),
  ];

  return usernameConflictMessage(candidate, existing, {
    taken:
      "That username is taken. Choose another that is at least 75% different from existing usernames.",
    similar:
      "That username is too similar to an existing one. Choose another that is at least 75% different.",
  });
}
