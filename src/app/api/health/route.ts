import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Lightweight health for deploy / canary checks. */
export async function GET() {
  const started = Date.now();
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({
      ok: true,
      db: true,
      ms: Date.now() - started,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        db: false,
        error: e instanceof Error ? e.message : "db error",
        ms: Date.now() - started,
      },
      { status: 503 },
    );
  }
}
