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
console.log("Adding sleep_space_config + work_space_config columns...");

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sleep_space_config text
`;

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS work_space_config text
`;

console.log("Done.");
