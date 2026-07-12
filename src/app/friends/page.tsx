import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FriendsClient } from "@/components/friends-client";
import { SiteHeader } from "@/components/site-header";
import { getFriendships } from "@/lib/friends";

export const metadata = { title: "Friends" };

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rows = await getFriendships(session.user.id);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Friends</h1>
        <p className="mt-2 text-sm text-muted">
          Private leaderboard among people you accept.
        </p>
        <div className="mt-6">
          <FriendsClient
            rows={rows.map((r) => ({
              id: r.id,
              status: r.status,
              otherName: r.otherName,
              otherUsername: r.otherUsername,
              isIncoming: r.isIncoming,
              isOutgoing: r.isOutgoing,
            }))}
          />
        </div>
      </main>
    </div>
  );
}
