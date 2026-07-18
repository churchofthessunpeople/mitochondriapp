import { ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  isReservedUsername,
  listReservedUsernames,
} from "@/lib/reserved-usernames";
import { usernameConflictMessage } from "@/lib/username";

/**
 * Server-side uniqueness + 90% similarity cap against all usernames
 * (and reserved names).
 */
export async function getUsernameConflictError(
  candidate: string,
  options?: { excludeUserId?: string },
): Promise<string | null> {
  if (isReservedUsername(candidate)) {
    return "Username: that name is not available.";
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
      "Username: already taken. Choose another that is less than 90% similar to existing usernames.",
    similar:
      "Username: too similar to an existing username (must be less than 90% similar).",
  });
}
