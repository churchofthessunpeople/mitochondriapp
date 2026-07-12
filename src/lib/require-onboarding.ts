import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { userFavorites, users } from "@/db/schema";

/** Request-scoped user flags (dedupes SiteHeader / pages / onboarding). */
export const getUserAppFlags = cache(async (userId: string) => {
  const [row] = await db
    .select({
      onboardingComplete: users.onboardingComplete,
      postalCode: users.postalCode,
      placeLabel: users.placeLabel,
      regionId: users.regionId,
      latitude: users.latitude,
      longitude: users.longitude,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
});

/** Send incomplete users through setup before main app surfaces. */
export async function redirectIfNeedsOnboarding(userId: string) {
  const row = await getUserAppFlags(userId);
  if (!row) return;
  if (row.onboardingComplete) return;

  // Legacy accounts already using the app — don't force the wizard
  const [fav] = await db
    .select({ protocolId: userFavorites.protocolId })
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId))
    .limit(1);

  const looksEstablished =
    Boolean(row.postalCode || row.placeLabel || row.regionId) ||
    Boolean(fav);

  if (looksEstablished) {
    await db
      .update(users)
      .set({ onboardingComplete: true })
      .where(eq(users.id, userId));
    return;
  }

  redirect("/onboarding");
}

export async function getOnboardingStatus(userId: string) {
  return getUserAppFlags(userId);
}
