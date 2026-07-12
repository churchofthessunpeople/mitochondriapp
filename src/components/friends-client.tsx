"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  respondFriendRequestAction,
  sendFriendRequestAction,
} from "@/lib/actions/friends";
import { useToast } from "@/components/toast";

type Row = {
  id: string;
  status: string;
  otherName: string;
  otherUsername: string;
  isIncoming: boolean;
  isOutgoing: boolean;
};

export function FriendsClient({ rows }: { rows: Row[] }) {
  const [username, setUsername] = useState("");
  const [pending, start] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function send() {
    start(async () => {
      try {
        await sendFriendRequestAction(username);
        push("Request sent");
        setUsername("");
        router.refresh();
      } catch (e) {
        push(e instanceof Error ? e.message : "Failed", "err");
      }
    });
  }

  function respond(id: string, accept: boolean) {
    start(async () => {
      try {
        await respondFriendRequestAction(id, accept);
        push(accept ? "Friend added" : "Declined");
        router.refresh();
      } catch (e) {
        push(e instanceof Error ? e.message : "Failed", "err");
      }
    });
  }

  const incoming = rows.filter((r) => r.isIncoming);
  const outgoing = rows.filter((r) => r.isOutgoing);
  const friends = rows.filter((r) => r.status === "accepted");

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-4">
        <label className="text-sm font-medium">Add by username</label>
        <div className="mt-2 flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field-input flex-1 rounded-2xl px-3 py-2 text-sm"
            placeholder="username"
          />
          <button
            type="button"
            disabled={pending || !username.trim()}
            onClick={send}
            className="btn-primary rounded-2xl px-4 text-sm font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {incoming.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Requests</h2>
          <ul className="space-y-2">
            {incoming.map((r) => (
              <li
                key={r.id}
                className="glass flex items-center justify-between rounded-2xl p-3"
              >
                <span>
                  {r.otherName}{" "}
                  <span className="text-xs text-muted">@{r.otherUsername}</span>
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => respond(r.id, true)}
                    className="rounded-xl bg-accent px-3 py-1 text-xs font-semibold text-[#041016]"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => respond(r.id, false)}
                    className="rounded-xl border border-border px-3 py-1 text-xs"
                  >
                    Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {outgoing.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Outgoing</h2>
          <ul className="space-y-2 text-sm text-muted">
            {outgoing.map((r) => (
              <li key={r.id} className="glass rounded-2xl p-3">
                Pending · @{r.otherUsername}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-muted">No friends yet.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((r) => (
              <li key={r.id} className="glass rounded-2xl p-3 text-sm">
                {r.otherName}{" "}
                <span className="text-muted">@{r.otherUsername}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
