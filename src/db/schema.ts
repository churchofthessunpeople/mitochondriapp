import {
  boolean,
  date,
  doublePrecision,
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

export const categoryEnum = pgEnum("protocol_category", [
  "light",
  "grounding",
  "water_food",
  "cold",
  "emf",
  "sleep",
  "movement",
  "other",
]);

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "rejected",
]);

/**
 * Curated places for lifestyle context (sun path, magnetism notes, health rating).
 * Ratings are educational / community-curated — not medical advice.
 */
export const regions = pgTable("regions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  /** Optional sub-area e.g. "San Salvador" */
  locality: text("locality"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  /**
   * 1–5 composite "environment for mitochondrial lifestyle" score
   * (light access, magnetic/geological context, policy environment, etc.)
   */
  healthRating: integer("health_rating").notNull().default(3),
  /** 1–5 sunlight / latitude quality */
  sunScore: integer("sun_score").notNull().default(3),
  /** 1–5 magnetic / geological vitality (volcanism, crustal activity, etc.) */
  magnetismScore: integer("magnetism_score").notNull().default(3),
  /** 1–5 policy / culture fit (e.g. outdoors culture, bitcoin, regulation) */
  policyScore: integer("policy_score").notNull().default(3),
  summary: text("summary").notNull().default(""),
  magnetismNotes: text("magnetism_notes").notNull().default(""),
  lightNotes: text("light_notes").notNull().default(""),
  policyNotes: text("policy_notes").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

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
  timezone: text("timezone").default("UTC"),
  regionId: text("region_id").references(() => regions.id, {
    onDelete: "set null",
  }),
  isAdmin: boolean("is_admin").notNull().default(false),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(true),
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

export const protocols = pgTable("protocols", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  category: categoryEnum("category").notNull().default("other"),
  timeOfDay: timeOfDayEnum("time_of_day").notNull().default("anytime"),
  lockedTimeOfDay: timeOfDayEnum("locked_time_of_day"),
  allowsMultiple: boolean("allows_multiple").notNull().default(false),
  /** Cap logs per calendar day (multi). 1 for single-allow. */
  maxPerDay: integer("max_per_day").notNull().default(1),
  /** If true, user can enter duration; points scale with minutes */
  durationEnabled: boolean("duration_enabled").notNull().default(false),
  /** Minutes that earn base `points` when durationEnabled */
  referenceMinutes: integer("reference_minutes").notNull().default(10),
  maxDurationMinutes: integer("max_duration_minutes").notNull().default(60),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const userFavorites = pgTable(
  "user_favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    protocolId: text("protocol_id")
      .notNull()
      .references(() => protocols.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.protocolId] })],
);

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
  durationMinutes: integer("duration_minutes"),
  pointsEarned: integer("points_earned").notNull(),
  isStreakBonus: boolean("is_streak_bonus").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const friendships = pgTable(
  "friendships",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("friendship_pair_uidx").on(table.requesterId, table.addresseeId),
  ],
);

export const userReminders = pgTable(
  "user_reminders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    /** Local time HH:mm */
    localTime: text("local_time").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [unique("user_reminder_time_uidx").on(table.userId, table.localTime)],
);

export type User = typeof users.$inferSelect;
export type Region = typeof regions.$inferSelect;
export type Protocol = typeof protocols.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserScheduleItem = typeof userScheduleItems.$inferSelect;
export type DailyCompletion = typeof dailyCompletions.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type UserReminder = typeof userReminders.$inferSelect;
export type TimeOfDay = (typeof timeOfDayEnum.enumValues)[number];
export type ProtocolCategory = (typeof categoryEnum.enumValues)[number];
