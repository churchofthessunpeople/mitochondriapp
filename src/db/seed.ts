import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { protocols, regions } from "./schema";
import { PROTOCOL_SEEDS } from "./seed-data";
import { REGION_SEEDS } from "./region-seeds";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const db = drizzle(neon(url));

  for (const region of REGION_SEEDS) {
    await db
      .insert(regions)
      .values({ ...region, active: true })
      .onConflictDoUpdate({
        target: regions.id,
        set: {
          name: region.name,
          country: region.country,
          locality: region.locality,
          latitude: region.latitude,
          longitude: region.longitude,
          timezone: region.timezone,
          healthRating: region.healthRating,
          sunScore: region.sunScore,
          magnetismScore: region.magnetismScore,
          policyScore: region.policyScore,
          summary: region.summary,
          magnetismNotes: region.magnetismNotes,
          lightNotes: region.lightNotes,
          policyNotes: region.policyNotes,
          sortOrder: region.sortOrder,
          active: true,
        },
      });
  }
  console.log(`Seeded ${REGION_SEEDS.length} regions.`);

  for (const protocol of PROTOCOL_SEEDS) {
    await db
      .insert(protocols)
      .values({
        id: protocol.id,
        name: protocol.name,
        description: protocol.description,
        points: protocol.points,
        category: protocol.category,
        timeOfDay: protocol.timeOfDay,
        lockedTimeOfDay: protocol.lockedTimeOfDay,
        allowsMultiple: protocol.allowsMultiple,
        maxPerDay: protocol.maxPerDay,
        durationEnabled: protocol.durationEnabled,
        referenceMinutes: protocol.referenceMinutes,
        maxDurationMinutes: protocol.maxDurationMinutes,
        sortOrder: protocol.sortOrder,
        active: true,
      })
      .onConflictDoUpdate({
        target: protocols.id,
        set: {
          name: protocol.name,
          description: protocol.description,
          points: protocol.points,
          category: protocol.category,
          timeOfDay: protocol.timeOfDay,
          lockedTimeOfDay: protocol.lockedTimeOfDay,
          allowsMultiple: protocol.allowsMultiple,
          maxPerDay: protocol.maxPerDay,
          durationEnabled: protocol.durationEnabled,
          referenceMinutes: protocol.referenceMinutes,
          maxDurationMinutes: protocol.maxDurationMinutes,
          sortOrder: protocol.sortOrder,
          active: true,
        },
      });
  }

  console.log(`Seeded ${PROTOCOL_SEEDS.length} protocols.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
