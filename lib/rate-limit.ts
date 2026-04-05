// lib/rate-limit.ts
import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextResponse } from "next/server";

// General API rate limiter: 30 requests per minute
const generalLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

// Auth rate limiter: 5 attempts per minute (prevents brute force)
const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

// Upload rate limiter: 10 uploads per minute
const uploadLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

export async function rateLimit(
  ip: string,
  type: "general" | "auth" | "upload" = "general"
) {
  try {
    const limiter =
      type === "auth"
        ? authLimiter
        : type === "upload"
        ? uploadLimiter
        : generalLimiter;

    await limiter.consume(ip);
    return null;
  } catch {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
}

export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "127.0.0.1";
  return ip;
}