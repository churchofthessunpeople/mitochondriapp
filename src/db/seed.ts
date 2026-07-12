import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { protocols } from "./schema";
import { PROTOCOL_SEEDS } from "./seed-data";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to seed the database");
  }

  const db = drizzle(neon(url));

  for (const protocol of PROTOCOL_SEEDS) {
    await db
      .insert(protocols)
      .values({
        id: protocol.id,
        name: protocol.name,
        description: protocol.description,
        points: protocol.points,
        timeOfDay: protocol.timeOfDay,
        lockedTimeOfDay: protocol.lockedTimeOfDay,
        allowsMultiple: protocol.allowsMultiple,
        sortOrder: protocol.sortOrder,
        active: true,
      })
      .onConflictDoUpdate({
        target: protocols.id,
        set: {
          name: protocol.name,
          description: protocol.description,
          points: protocol.points,
          timeOfDay: protocol.timeOfDay,
          lockedTimeOfDay: protocol.lockedTimeOfDay,
          allowsMultiple: protocol.allowsMultiple,
          sortOrder: protocol.sortOrder,
          active: true,
        },
      });
  }

  console.log(`Seeded ${PROTOCOL_SEEDS.length} protocols.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
