import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Always treated as admins (in addition to is_admin / ADMIN_USERNAMES). */
export const BOOTSTRAP_ADMIN_USERNAMES = ["churchofthesunpeople"] as const;

function envAdminUsernames(): string[] {
  return (
    process.env.ADMIN_USERNAMES?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

export function usernameHasAdminAccess(
  username: string | null | undefined,
  isAdminFlag: boolean,
): boolean {
  if (isAdminFlag) return true;
  const u = (username ?? "").toLowerCase();
  if (!u) return false;
  if (
    (BOOTSTRAP_ADMIN_USERNAMES as readonly string[]).includes(u) ||
    envAdminUsernames().includes(u)
  ) {
    return true;
  }
  return false;
}

export async function getIsAdminForUserId(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ isAdmin: users.isAdmin, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return false;
  return usernameHasAdminAccess(row.username, row.isAdmin);
}

/**
 * Persist is_admin=true when the username is a bootstrap/env admin.
 * Keeps the DB flag in sync so other tools see the grant.
 */
export async function ensureAdminFlagSynced(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ isAdmin: users.isAdmin, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return false;
  const allowed = usernameHasAdminAccess(row.username, row.isAdmin);
  if (allowed && !row.isAdmin) {
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, userId));
  }
  return allowed;
}

export async function requireAdmin(): Promise<{
  userId: string;
  username: string;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const [u] = await db
    .select({ isAdmin: users.isAdmin, username: users.username })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!u || !usernameHasAdminAccess(u.username, u.isAdmin)) {
    throw new Error("Admin only");
  }
  return { userId: session.user.id, username: u.username };
}
