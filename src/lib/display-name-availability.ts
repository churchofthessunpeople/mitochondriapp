import { ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  MIN_DISPLAY_NAME_DISSIMILARITY,
  nameConflictMessage,
} from "@/lib/name-similarity";
import {
  isReservedUsername,
  listReservedUsernames,
} from "@/lib/reserved-usernames";

/**
 * Server-side uniqueness + 90% similarity cap for display names.
 * Compared against other users' display names, usernames, and reserved names.
 */
export async function getDisplayNameConflictError(
  candidate: string,
  options?: { excludeUserId?: string },
): Promise<string | null> {
  const trimmed = candidate.trim();
  if (isReservedUsername(trimmed)) {
    return "That display name is not available.";
  }

  const rows = options?.excludeUserId
    ? await db
        .select({
          displayName: users.displayName,
          username: users.username,
        })
        .from(users)
        .where(ne(users.id, options.excludeUserId))
    : await db.select({
        displayName: users.displayName,
        username: users.username,
      }).from(users);

  const existing: string[] = [...listReservedUsernames()];
  for (const row of rows) {
    if (row.displayName?.trim()) existing.push(row.displayName.trim());
    existing.push(row.username);
  }

  return nameConflictMessage(
    trimmed,
    existing,
    {
      taken:
        "That display name is taken. Choose another that is less than 90% similar to existing names.",
      similar:
        "That display name is too similar to an existing one (must be less than 90% similar).",
    },
    MIN_DISPLAY_NAME_DISSIMILARITY,
  );
}
