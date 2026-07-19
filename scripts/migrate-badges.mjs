import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(url);
console.log("Creating user_badges + celebration columns...");

await sql`
  CREATE TABLE IF NOT EXISTS user_badges (
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key text NOT NULL,
    streak_days integer NOT NULL,
    earned_at timestamp NOT NULL DEFAULT now(),
    celebrated_at timestamp,
    PRIMARY KEY (user_id, badge_key)
  )
`;

await sql`ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS celebrated_at timestamp`;

// Existing badges already earned before celebrations shipped — don't replay popups
await sql`
  UPDATE user_badges
  SET celebrated_at = earned_at
  WHERE celebrated_at IS NULL
`;

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS celebrated_level integer NOT NULL DEFAULT 0
`;

console.log("Done.");
