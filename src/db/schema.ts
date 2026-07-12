import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const timeOfDayEnum = pgEnum("time_of_day", [
  "sunrise",
  "morning",
  "afternoon",
  "evening",
  "sunset",
  "night",
  "anytime",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  sessionVersion: integer("session_version").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { mode: "date" }).notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/**
 * Global activity catalog.
 * - defaultTimeOfDay: suggested slot when first added to a user's schedule
 * - lockedTimeOfDay: if set, may only appear in that slot (e.g. sunrise)
 * - allowsMultiple: can log more than once per day
 */
export const protocols = pgTable("protocols", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  /** Catalog default / suggestion */
  timeOfDay: timeOfDayEnum("time_of_day").notNull().default("anytime"),
  lockedTimeOfDay: timeOfDayEnum("locked_time_of_day"),
  allowsMultiple: boolean("allows_multiple").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/** Per-user: which activities appear in which time-of-day section */
export const userScheduleItems = pgTable(
  "user_schedule_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    protocolId: text("protocol_id")
      .notNull()
      .references(() => protocols.id, { onDelete: "cascade" }),
    timeOfDay: timeOfDayEnum("time_of_day").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("user_protocol_slot_uidx").on(
      table.userId,
      table.protocolId,
      table.timeOfDay,
    ),
  ],
);

/**
 * One row per log event. Multi-allow protocols may have many rows per day.
 * Single-allow protocols: app enforces at most one per user/protocol/day.
 */
export const dailyCompletions = pgTable("daily_completions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  protocolId: text("protocol_id")
    .notNull()
    .references(() => protocols.id, { onDelete: "cascade" }),
  completedOn: date("completed_on", { mode: "string" }).notNull(),
  timeOfDay: timeOfDayEnum("time_of_day"),
  pointsEarned: integer("points_earned").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type Protocol = typeof protocols.$inferSelect;
export type UserScheduleItem = typeof userScheduleItems.$inferSelect;
export type DailyCompletion = typeof dailyCompletions.$inferSelect;
export type TimeOfDay = (typeof timeOfDayEnum.enumValues)[number];
