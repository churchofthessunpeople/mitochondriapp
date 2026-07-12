import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { ThemeToggle } from "@/components/theme-toggle";
import { getActiveProtocols } from "@/lib/data";
import { getUserFavoriteIds } from "@/lib/favorites";
import { STARTER_PROTOCOL_IDS } from "@/lib/onboarding";
import { getOnboardingStatus } from "@/lib/require-onboarding";
import { logoutAction } from "@/lib/actions/auth";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Get started" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(ROUTES.login);

  const status = await getOnboardingStatus(session.user.id);
  if (status?.onboardingComplete) redirect(ROUTES.home);

  const [protocols, availableIds] = await Promise.all([
    getActiveProtocols(),
    getUserFavoriteIds(session.user.id),
  ]);

  const starterSet = new Set<string>(STARTER_PROTOCOL_IDS);
  const starterProtocols = protocols.filter((p) => starterSet.has(p.id));
  // If seeds missing some IDs, fall back to first 10 catalog items
  const starters =
    starterProtocols.length >= 4
      ? starterProtocols
      : protocols.slice(0, 10);

  return (
    <div className="min-h-dvh pb-10">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-muted hover:text-foreground"
          >
            Log out
          </button>
        </form>
        <ThemeToggle size="sm" />
      </div>
      <OnboardingWizard
        starterProtocols={starters}
        initialAvailableIds={[...availableIds]}
        currentZip={status?.postalCode}
        placeLabel={status?.placeLabel}
      />
    </div>
  );
}
