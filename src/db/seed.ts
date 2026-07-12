import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { protocols, users } from "./schema";
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
      .values(protocol)
      .onConflictDoUpdate({
        target: protocols.id,
        set: {
          name: protocol.name,
          description: protocol.description,
          points: protocol.points,
          timeOfDay: protocol.timeOfDay,
          sortOrder: protocol.sortOrder,
          active: true,
        },
      });
  }

  console.log(`Seeded ${PROTOCOL_SEEDS.length} protocols.`);

  // Grandfather existing accounts created before email verification shipped
  const verified = await db
    .update(users)
    .set({ emailVerified: sql`coalesce(${users.createdAt}, now())` })
    .where(isNull(users.emailVerified))
    .returning({ id: users.id });

  if (verified.length > 0) {
    console.log(
      `Marked ${verified.length} existing user(s) as email-verified (migration).`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
