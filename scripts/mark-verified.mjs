import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
config({ path: ".env" });
const sql = neon(process.env.DATABASE_URL);
const r = await sql`UPDATE users SET email_verified = COALESCE(email_verified, now()) WHERE email_verified IS NULL RETURNING email`;
console.log("updated", r.length, r);
