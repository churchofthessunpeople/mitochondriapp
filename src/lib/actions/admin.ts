"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { protocols, users, type ProtocolCategory, type TimeOfDay } from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/categories";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const [u] = await db
    .select({ isAdmin: users.isAdmin, username: users.username })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const allow =
    u?.isAdmin ||
    process.env.ADMIN_USERNAMES?.split(",")
      .map((s) => s.trim().toLowerCase())
      .includes(u?.username ?? "");
  if (!allow) throw new Error("Admin only");
  return session.user.id;
}

const protocolSchema = z.object({
  id: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  description: z.string().min(4).max(500),
  points: z.coerce.number().int().min(1).max(100),
  category: z.enum(CATEGORY_ORDER as [ProtocolCategory, ...ProtocolCategory[]]),
  timeOfDay: z.enum(TIME_OF_DAY_ORDER as [TimeOfDay, ...TimeOfDay[]]),
  allowsMultiple: z.coerce.boolean().optional(),
  maxPerDay: z.coerce.number().int().min(1).max(20).optional(),
  durationEnabled: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
});

export async function upsertProtocolAction(formData: FormData) {
  await requireAdmin();
  const parsed = protocolSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
    points: formData.get("points"),
    category: formData.get("category"),
    timeOfDay: formData.get("timeOfDay"),
    allowsMultiple: formData.get("allowsMultiple") === "on",
    maxPerDay: formData.get("maxPerDay") || 1,
    durationEnabled: formData.get("durationEnabled") === "on",
    active: formData.get("active") !== "off",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  const p = parsed.data;
  await db
    .insert(protocols)
    .values({
      id: p.id,
      name: p.name,
      description: p.description,
      points: p.points,
      category: p.category,
      timeOfDay: p.timeOfDay,
      allowsMultiple: p.allowsMultiple ?? false,
      maxPerDay: p.allowsMultiple ? p.maxPerDay ?? 5 : 1,
      durationEnabled: p.durationEnabled ?? false,
      referenceMinutes: 10,
      maxDurationMinutes: 60,
      sortOrder: 100,
      active: p.active ?? true,
    })
    .onConflictDoUpdate({
      target: protocols.id,
      set: {
        name: p.name,
        description: p.description,
        points: p.points,
        category: p.category,
        timeOfDay: p.timeOfDay,
        allowsMultiple: p.allowsMultiple ?? false,
        maxPerDay: p.allowsMultiple ? p.maxPerDay ?? 5 : 1,
        durationEnabled: p.durationEnabled ?? false,
        active: p.active ?? true,
      },
    });

  revalidatePath("/today");
  revalidatePath("/admin");
}

export async function deleteProtocolAction(id: string) {
  await requireAdmin();
  await db.update(protocols).set({ active: false }).where(eq(protocols.id, id));
  revalidatePath("/admin");
  revalidatePath("/today");
}
