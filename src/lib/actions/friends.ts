"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { friendships, users } from "@/db/schema";

async function uid() {
  const s = await auth();
  if (!s?.user?.id) throw new Error("Unauthorized");
  return s.user.id;
}

export async function sendFriendRequestAction(username: string) {
  const userId = await uid();
  const handle = username.trim().toLowerCase();
  const [target] = await db
    .select()
    .from(users)
    .where(eq(users.username, handle))
    .limit(1);

  if (!target) throw new Error("User not found");
  if (target.id === userId) throw new Error("That is you");

  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, target.id),
        ),
        and(
          eq(friendships.requesterId, target.id),
          eq(friendships.addresseeId, userId),
        ),
      ),
    )
    .limit(1);

  if (existing) throw new Error("Already friends or request pending");

  await db.insert(friendships).values({
    requesterId: userId,
    addresseeId: target.id,
    status: "pending",
  });

  revalidatePath("/friends");
  revalidatePath("/leaderboard");
}

export async function respondFriendRequestAction(
  friendshipId: string,
  accept: boolean,
) {
  const userId = await uid();
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, friendshipId),
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    )
    .limit(1);

  if (!row) throw new Error("Request not found");

  if (accept) {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, friendshipId));
  } else {
    await db
      .update(friendships)
      .set({ status: "rejected" })
      .where(eq(friendships.id, friendshipId));
  }

  revalidatePath("/friends");
  revalidatePath("/leaderboard");
}
