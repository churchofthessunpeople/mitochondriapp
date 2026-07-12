/**
 * Full schema upgrade for feature batch (safe to re-run).
 * npm run db:setup
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { spawnSync } from "child_process";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(url);
console.log("Running schema migrations...");

// Enums (ignore if exist via DO blocks)
await sql`
  DO $$ BEGIN
    CREATE TYPE protocol_category AS ENUM (
      'light','grounding','water_food','cold','emf','sleep','movement','other'
    );
  EXCEPTION WHEN duplicate_object THEN null; END $$
`;
await sql`
  DO $$ BEGIN
    CREATE TYPE friendship_status AS ENUM ('pending','accepted','rejected');
  EXCEPTION WHEN duplicate_object THEN null; END $$
`;

// Users
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC'`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_leaderboard boolean NOT NULL DEFAULT true`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username text`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0`;

// Username backfill if needed
await sql`
  UPDATE users SET username = lower(coalesce(split_part(email,'@',1), 'user_' || left(id,8)))
  WHERE username IS NULL OR username = ''
`;

// Protocols
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS locked_time_of_day time_of_day`;
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS allows_multiple boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS max_per_day integer NOT NULL DEFAULT 1`;
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS duration_enabled boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS reference_minutes integer NOT NULL DEFAULT 10`;
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS max_duration_minutes integer NOT NULL DEFAULT 60`;
await sql`
  DO $$ BEGIN
    ALTER TABLE protocols ADD COLUMN category protocol_category NOT NULL DEFAULT 'other';
  EXCEPTION WHEN duplicate_column THEN null; END $$
`;

// Favorites
await sql`
  CREATE TABLE IF NOT EXISTS user_favorites (
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol_id text NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, protocol_id)
  )
`;

// Schedule
await sql`
  CREATE TABLE IF NOT EXISTS user_schedule_items (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol_id text NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    time_of_day time_of_day NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_protocol_slot_uidx ON user_schedule_items (user_id, protocol_id, time_of_day)`;

// Completions
await sql`ALTER TABLE daily_completions DROP CONSTRAINT IF EXISTS user_protocol_day_uidx`;
await sql`DROP INDEX IF EXISTS user_protocol_day_uidx`;
await sql`ALTER TABLE daily_completions ADD COLUMN IF NOT EXISTS time_of_day time_of_day`;
await sql`ALTER TABLE daily_completions ADD COLUMN IF NOT EXISTS duration_minutes integer`;
await sql`ALTER TABLE daily_completions ADD COLUMN IF NOT EXISTS is_streak_bonus boolean NOT NULL DEFAULT false`;

// Rate limits
await sql`
  CREATE TABLE IF NOT EXISTS rate_limits (
    key text PRIMARY KEY,
    count integer NOT NULL DEFAULT 0,
    window_start timestamp NOT NULL
  )
`;

// Friendships
await sql`
  CREATE TABLE IF NOT EXISTS friendships (
    id text PRIMARY KEY,
    requester_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friendship_status NOT NULL DEFAULT 'pending',
    created_at timestamp NOT NULL DEFAULT now()
  )
`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS friendship_pair_uidx ON friendships (requester_id, addressee_id)`;

// Reminders
await sql`
  CREATE TABLE IF NOT EXISTS user_reminders (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label text NOT NULL,
    local_time text NOT NULL,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_reminder_time_uidx ON user_reminders (user_id, local_time)`;

console.log("Schema OK. Seeding protocols...");
const seed = spawnSync("npx", ["tsx", "src/db/seed.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
if (seed.status !== 0) process.exit(seed.status ?? 1);
console.log("db:setup complete.");
