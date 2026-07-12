import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Prefer .env.local; fall back to .env (either is fine locally)
config({ path: ".env.local" });
config({ path: ".env" });


export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
