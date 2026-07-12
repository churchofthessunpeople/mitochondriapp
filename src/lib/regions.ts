import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { regions, type Region } from "@/db/schema";
import { REGION_SEEDS } from "@/db/region-seeds";

export const listRegions = cache(async (): Promise<Region[]> => {
  try {
    const rows = await db
      .select()
      .from(regions)
      .where(eq(regions.active, true))
      .orderBy(asc(regions.sortOrder), asc(regions.name));
    if (rows.length > 0) return rows;
  } catch {
    // fall through
  }
  return REGION_SEEDS.map((s) => ({
    ...s,
    active: true,
    createdAt: new Date(),
  }));
});

export const getRegionById = cache(async (id: string | null | undefined) => {
  if (!id) return null;
  try {
    const [row] = await db
      .select()
      .from(regions)
      .where(eq(regions.id, id))
      .limit(1);
    return row ?? null;
  } catch {
    return REGION_SEEDS.find((r) => r.id === id)
      ? ({
          ...REGION_SEEDS.find((r) => r.id === id)!,
          active: true,
          createdAt: new Date(),
        } as Region)
      : null;
  }
});

export function ratingLabel(n: number): string {
  if (n >= 5) return "Exceptional";
  if (n >= 4) return "Strong";
  if (n >= 3) return "Mixed";
  if (n >= 2) return "Challenging";
  return "Difficult";
}
