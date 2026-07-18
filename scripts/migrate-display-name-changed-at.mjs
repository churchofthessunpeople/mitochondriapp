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
console.log("Adding users.display_name_changed_at if missing...");

await sql`
  ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name_changed_at timestamp
`;

console.log("Done.");
