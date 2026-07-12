import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);
console.log("Creating user_favorites...");

await sql`
  CREATE TABLE IF NOT EXISTS user_favorites (
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol_id text NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    created_at timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, protocol_id)
  )
`;

console.log("Done.");
