import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { protocols, users } from "@/db/schema";
import {
  deleteProtocolAction,
  upsertProtocolAction,
} from "@/lib/actions/admin";
import { CATEGORY_ORDER } from "@/lib/categories";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const allow =
    u?.isAdmin ||
    process.env.ADMIN_USERNAMES?.split(",")
      .map((s) => s.trim().toLowerCase())
      .includes(u?.username ?? "");

  if (!allow) {
    return (
      <div className="min-h-screen pb-24">
        <SiteHeader active="account" />
        <main className="mx-auto max-w-lg px-4 py-12 text-center">
          <h1 className="text-xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-muted">
            Set <code className="text-accent">is_admin</code> on your user or
            add your username to <code className="text-accent">ADMIN_USERNAMES</code>.
          </p>
        </main>
      </div>
    );
  }

  const catalog = await db.select().from(protocols).orderBy(protocols.sortOrder);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold">Admin · protocols</h1>
          <p className="mt-2 text-sm text-muted">
            Create or update catalog activities.
          </p>
        </div>

        <form
          action={async (fd) => {
            "use server";
            await upsertProtocolAction(fd);
          }}
          className="glass space-y-3 rounded-3xl p-5"
        >
          <h2 className="font-semibold">Upsert activity</h2>
          <input name="id" required placeholder="id-slug" className="field-input w-full rounded-xl px-3 py-2 text-sm" />
          <input name="name" required placeholder="Name" className="field-input w-full rounded-xl px-3 py-2 text-sm" />
          <textarea name="description" required placeholder="Description" className="field-input w-full rounded-xl px-3 py-2 text-sm" rows={3} />
          <input name="points" type="number" defaultValue={5} className="field-input w-full rounded-xl px-3 py-2 text-sm" />
          <select name="category" className="field-input w-full rounded-xl px-3 py-2 text-sm">
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select name="timeOfDay" className="field-input w-full rounded-xl px-3 py-2 text-sm">
            {TIME_OF_DAY_ORDER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allowsMultiple" /> Multi-log
          </label>
          <input name="maxPerDay" type="number" defaultValue={5} className="field-input w-full rounded-xl px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="durationEnabled" /> Duration timer
          </label>
          <button type="submit" className="btn-primary h-11 w-full rounded-2xl font-semibold">
            Save
          </button>
        </form>

        <ul className="space-y-2">
          {catalog.map((p) => (
            <li
              key={p.id}
              className="glass flex items-start justify-between gap-3 rounded-2xl p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {p.name}{" "}
                  {!p.active && (
                    <span className="text-xs text-red-400">inactive</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {p.id} · {p.category} · +{p.points}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteProtocolAction(p.id);
                }}
              >
                <button type="submit" className="text-xs text-red-400">
                  Disable
                </button>
              </form>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
