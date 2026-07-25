import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}
const sql = neon(url);

// Face plunge remaps via migrate-vagus-merge. Catalog copy lives in seeds.
await sql`
  update protocols
  set
    name = 'Cold thermogenesis',
    description = 'Cold plunge or cold shower. Pick mode, skin temp (~50°F target), and duration.',
    points = 24,
    duration_enabled = true,
    max_duration_minutes = 20
  where id = 'cold-thermogenesis'
`;

console.log("cold thermo FK sync only (no content_overrides)", {
  note: "cold-face-plunge favorites remap via migrate-vagus-merge.mjs",
});
