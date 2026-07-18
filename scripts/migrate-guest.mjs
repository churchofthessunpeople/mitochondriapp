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
console.log("Adding guest / tutorial columns...");

await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest boolean NOT NULL DEFAULT false`;
// Existing rows get true (skip tutorial); new inserts use DEFAULT false.
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_complete boolean NOT NULL DEFAULT true`;
await sql`ALTER TABLE users ALTER COLUMN tutorial_complete SET DEFAULT false`;

console.log("Done.");
