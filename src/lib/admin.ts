import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Admin = DB flag only. Promote with: npm run admin:promote -- <username> */
export async function getIsAdminForUserId(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return Boolean(row?.isAdmin);
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
  if (!u?.isAdmin) {
    throw new Error("Admin only");
  }
  return { userId: session.user.id, username: u.username };
}
