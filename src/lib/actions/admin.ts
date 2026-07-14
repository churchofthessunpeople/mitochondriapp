"use server";

import bcrypt from "bcryptjs";
import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { generateStrongPassword } from "@/lib/generate-password";
import { validateNewPassword } from "@/lib/password";
import { revalidateApp } from "@/lib/revalidate-app";
import { usernameSchema } from "@/lib/username";
import { db } from "@/db";
import {
  dailyCompletions,
  protocols,
  users,
  type ProtocolCategory,
  type TimeOfDay,
} from "@/db/schema";
import { CATEGORY_ORDER } from "@/lib/categories";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";

export type AdminUserListItem = {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  timezone: string | null;
  isAdmin: boolean;
  onboardingComplete: boolean;
  showOnLeaderboard: boolean;
  postalCode: string | null;
  placeLabel: string | null;
  createdAt: string;
  lifetimePoints: number;
  completionCount: number;
};

export type AdminUserDetail = AdminUserListItem & {
  name: string | null;
  regionId: string | null;
  latitude: number | null;
  longitude: number | null;
  elevationM: number | null;
  travelPostalCode: string | null;
  travelPlaceLabel: string | null;
  travelUntil: string | null;
  sessionVersion: number;
};

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
      maxPerDay: p.allowsMultiple ? (p.maxPerDay ?? 5) : 1,
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
        maxPerDay: p.allowsMultiple ? (p.maxPerDay ?? 5) : 1,
        durationEnabled: p.durationEnabled ?? false,
        active: p.active ?? true,
      },
    });

  revalidateApp();
}

export async function deleteProtocolAction(id: string) {
  await requireAdmin();
  await db.update(protocols).set({ active: false }).where(eq(protocols.id, id));
  revalidateApp();
}

export async function listAdminProtocolsAction() {
  await requireAdmin();
  const { getCatalogProtocols } = await import("@/lib/catalog");
  return getCatalogProtocols().map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    points: p.points,
    active: p.active,
  }));
}

export async function listAdminUsersAction(
  query?: string,
): Promise<AdminUserListItem[]> {
  await requireAdmin();
  const q = query?.trim();
  const filter = q
    ? or(
        ilike(users.username, `%${q}%`),
        ilike(users.displayName, `%${q}%`),
        ilike(users.email, `%${q}%`),
      )
    : undefined;

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      timezone: users.timezone,
      isAdmin: users.isAdmin,
      onboardingComplete: users.onboardingComplete,
      showOnLeaderboard: users.showOnLeaderboard,
      postalCode: users.postalCode,
      placeLabel: users.placeLabel,
      createdAt: users.createdAt,
      lifetimePoints: sql<number>`coalesce(${sum(dailyCompletions.pointsEarned)}, 0)`,
      completionCount: sql<number>`coalesce(${count(dailyCompletions.id)}, 0)`,
    })
    .from(users)
    .leftJoin(dailyCompletions, eq(dailyCompletions.userId, users.id))
    .where(filter)
    .groupBy(
      users.id,
      users.username,
      users.displayName,
      users.email,
      users.timezone,
      users.isAdmin,
      users.onboardingComplete,
      users.showOnLeaderboard,
      users.postalCode,
      users.placeLabel,
      users.createdAt,
    )
    .orderBy(desc(users.createdAt))
    .limit(200);

  return rows.map((r) => ({
    ...r,
    timezone: r.timezone ?? "UTC",
    createdAt: r.createdAt.toISOString(),
    lifetimePoints: Number(r.lifetimePoints) || 0,
    completionCount: Number(r.completionCount) || 0,
  }));
}

export async function getAdminUserDetailAction(
  userId: string,
): Promise<AdminUserDetail | null> {
  await requireAdmin();
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      name: users.name,
      email: users.email,
      timezone: users.timezone,
      isAdmin: users.isAdmin,
      onboardingComplete: users.onboardingComplete,
      showOnLeaderboard: users.showOnLeaderboard,
      postalCode: users.postalCode,
      placeLabel: users.placeLabel,
      regionId: users.regionId,
      latitude: users.latitude,
      longitude: users.longitude,
      elevationM: users.elevationM,
      travelPostalCode: users.travelPostalCode,
      travelPlaceLabel: users.travelPlaceLabel,
      travelUntil: users.travelUntil,
      sessionVersion: users.sessionVersion,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  const [stats] = await db
    .select({
      lifetimePoints: sql<number>`coalesce(${sum(dailyCompletions.pointsEarned)}, 0)`,
      completionCount: sql<number>`coalesce(${count(dailyCompletions.id)}, 0)`,
    })
    .from(dailyCompletions)
    .where(eq(dailyCompletions.userId, userId));

  return {
    ...row,
    timezone: row.timezone ?? "UTC",
    createdAt: row.createdAt.toISOString(),
    lifetimePoints: Number(stats?.lifetimePoints) || 0,
    completionCount: Number(stats?.completionCount) || 0,
  };
}

const adminUpdateUserSchema = z.object({
  userId: z.string().min(1),
  displayName: z
    .string()
    .max(40)
    .optional()
    .transform((v) => (v === undefined ? undefined : v.trim())),
  username: z.string().optional(),
  email: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t.length === 0 ? null : t.toLowerCase();
    }),
  timezone: z.string().min(1).max(80).optional(),
  isAdmin: z.boolean().optional(),
  onboardingComplete: z.boolean().optional(),
  showOnLeaderboard: z.boolean().optional(),
  postalCode: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t.length === 0 ? null : t;
    }),
  placeLabel: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const t = v.trim();
      return t.length === 0 ? null : t;
    }),
});

export async function updateAdminUserAction(input: {
  userId: string;
  displayName?: string;
  username?: string;
  email?: string;
  timezone?: string;
  isAdmin?: boolean;
  onboardingComplete?: boolean;
  showOnLeaderboard?: boolean;
  postalCode?: string;
  placeLabel?: string;
}): Promise<void> {
  const admin = await requireAdmin();
  const parsed = adminUpdateUserSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  const data = parsed.data;
  if (data.userId === admin.userId && data.isAdmin === false) {
    throw new Error("You cannot remove your own admin access");
  }

  const [existing] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.id, data.userId))
    .limit(1);
  if (!existing) throw new Error("User not found");

  const patch: Partial<typeof users.$inferInsert> = {};

  if (data.displayName !== undefined) {
    if (data.displayName.length === 0) {
      patch.displayName = null;
      patch.name = null;
    } else if (data.displayName.length < 2) {
      throw new Error("Display name must be at least 2 characters");
    } else {
      patch.displayName = data.displayName;
      patch.name = data.displayName;
    }
  }

  if (data.username !== undefined && data.username.trim()) {
    const uname = usernameSchema.parse(data.username);
    if (uname !== existing.username) {
      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, uname))
        .limit(1);
      if (taken) throw new Error("Username already taken");
      patch.username = uname;
    }
  }

  if (data.email !== undefined) {
    if (data.email !== null) {
      const emailOk = z.string().email().safeParse(data.email);
      if (!emailOk.success) throw new Error("Invalid email");
      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);
      if (taken && taken.id !== data.userId) {
        throw new Error("Email already in use");
      }
    }
    patch.email = data.email;
  }

  if (data.timezone !== undefined) patch.timezone = data.timezone;
  if (data.isAdmin !== undefined) patch.isAdmin = data.isAdmin;
  if (data.onboardingComplete !== undefined) {
    patch.onboardingComplete = data.onboardingComplete;
  }
  if (data.showOnLeaderboard !== undefined) {
    patch.showOnLeaderboard = data.showOnLeaderboard;
  }
  if (data.postalCode !== undefined) patch.postalCode = data.postalCode;
  if (data.placeLabel !== undefined) patch.placeLabel = data.placeLabel;

  if (Object.keys(patch).length === 0) return;

  await db.update(users).set(patch).where(eq(users.id, data.userId));
  revalidateApp();
}

export async function deleteAdminUserAction(userId: string): Promise<void> {
  const admin = await requireAdmin();
  if (userId === admin.userId) {
    throw new Error("You cannot delete your own account from admin");
  }
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!existing) throw new Error("User not found");

  await db.delete(users).where(eq(users.id, userId));
  revalidateApp();
}

/** Reset password and return the new plaintext once (admin must copy it). */
export async function resetAdminUserPasswordAction(
  userId: string,
): Promise<{ password: string }> {
  await requireAdmin();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!existing) throw new Error("User not found");

  const password = generateStrongPassword();
  const check = await validateNewPassword(password);
  if (!check.ok) throw new Error(check.message);

  const passwordHash = await bcrypt.hash(password, 12);
  await db
    .update(users)
    .set({
      passwordHash,
      sessionVersion: sql`${users.sessionVersion} + 1`,
    })
    .where(eq(users.id, userId));

  revalidateApp();
  return { password };
}

export async function countAdminUsersAction(): Promise<number> {
  await requireAdmin();
  const [row] = await db.select({ n: count() }).from(users);
  return Number(row?.n) || 0;
}
