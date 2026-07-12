import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { friendships, users } from "@/db/schema";

export async function getFriendIds(userId: string): Promise<string[]> {
  try {
    const rows = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, userId),
          ),
        ),
      );

    return rows.map((r) =>
      r.requesterId === userId ? r.addresseeId : r.requesterId,
    );
  } catch {
    return [];
  }
}

export async function getFriendships(userId: string) {
  try {
    const all = await db
      .select()
      .from(friendships)
      .where(
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, userId),
        ),
      );

    const otherIds = [
      ...new Set(
        all.map((f) =>
          f.requesterId === userId ? f.addresseeId : f.requesterId,
        ),
      ),
    ];

    const people =
      otherIds.length === 0
        ? []
        : await db.select().from(users).where(inArray(users.id, otherIds));

    const byId = new Map(people.map((u) => [u.id, u]));

    return all.map((f) => {
      const otherId =
        f.requesterId === userId ? f.addresseeId : f.requesterId;
      const other = byId.get(otherId);
      return {
        ...f,
        otherName: other?.displayName || other?.username || "User",
        otherUsername: other?.username || "",
        isIncoming: f.addresseeId === userId && f.status === "pending",
        isOutgoing: f.requesterId === userId && f.status === "pending",
      };
    });
  } catch {
    return [];
  }
}
