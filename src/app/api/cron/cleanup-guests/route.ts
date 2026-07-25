import { NextResponse } from "next/server";
import { purgeExpiredGuests } from "@/lib/guest-cleanup";

export const dynamic = "force-dynamic";

/**
 * Daily guest purge. Protect with CRON_SECRET:
 *   Authorization: Bearer <CRON_SECRET>
 * Vercel Cron sends this automatically when configured.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await purgeExpiredGuests();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/cleanup-guests]", e);
    return NextResponse.json(
      { ok: false, error: "Cleanup failed" },
      { status: 500 },
    );
  }
}
