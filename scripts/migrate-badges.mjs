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
console.log("Creating user_badges...");

await sql`
  CREATE TABLE IF NOT EXISTS user_badges (
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key text NOT NULL,
    streak_days integer NOT NULL,
    earned_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, badge_key)
  )
`;

console.log("Done.");
