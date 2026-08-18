// app/api/health/route.ts — a cheap liveness probe for uptime checks: no auth
// (excluded from the Clerk proxy matcher), no rendering, one `SELECT 1` bounded
// to 1.5 s so a slow DB reads as unhealthy rather than as a hung request.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 1500;

export async function GET() {
  const started = Date.now();
  let db: "ok" | "timeout" | "error" = "ok";
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), DB_TIMEOUT_MS)),
    ]);
  } catch (error) {
    db = error instanceof Error && error.message === "timeout" ? "timeout" : "error";
  }

  const ok = db === "ok";
  return NextResponse.json(
    { ok, db, dbMs: Date.now() - started, region: process.env.VERCEL_REGION ?? null },
    { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } }
  );
}
