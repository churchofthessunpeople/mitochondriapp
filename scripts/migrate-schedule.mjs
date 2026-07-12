/**
 * User schedules + multi-completion support.
 * npm run db:migrate-schedule
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);
console.log("Migrating schedule schema...");

await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS locked_time_of_day time_of_day`;
await sql`ALTER TABLE protocols ADD COLUMN IF NOT EXISTS allows_multiple boolean NOT NULL DEFAULT false`;

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

await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS user_protocol_slot_uidx
  ON user_schedule_items (user_id, protocol_id, time_of_day)
`;

// Drop old one-per-day unique if present
await sql`ALTER TABLE daily_completions DROP CONSTRAINT IF EXISTS user_protocol_day_uidx`;
await sql`DROP INDEX IF EXISTS user_protocol_day_uidx`;

await sql`ALTER TABLE daily_completions ADD COLUMN IF NOT EXISTS time_of_day time_of_day`;

console.log("Schedule migration done.");
