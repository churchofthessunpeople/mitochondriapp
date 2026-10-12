import { NextResponse } from "next/server";
import {
  parseFlares,
  parseKp,
  summarizeSolarActivity,
} from "@/lib/solar-activity";

export const dynamic = "force-dynamic";

const SWPC = "https://services.swpc.noaa.gov";
const FLARES_7_DAY_URL = `${SWPC}/json/goes/primary/xray-flares-7-day.json`;
const FLARE_LATEST_URL = `${SWPC}/json/goes/primary/xray-flares-latest.json`;
const KP_URL = `${SWPC}/products/noaa-planetary-k-index.json`;

async function fetchSwpcJson(url: string): Promise<unknown> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function GET() {
  const [flares7d, flareLatest, kp] = await Promise.all([
    fetchSwpcJson(FLARES_7_DAY_URL),
    fetchSwpcJson(FLARE_LATEST_URL),
    fetchSwpcJson(KP_URL),
  ]);

  if (flares7d == null && flareLatest == null && kp == null) {
    return NextResponse.json(
      { error: "Solar activity is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const activity = summarizeSolarActivity({
    flares: [...parseFlares(flares7d), ...parseFlares(flareLatest)],
    kp: parseKp(kp),
    now: new Date(),
  });

  return NextResponse.json(activity, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
