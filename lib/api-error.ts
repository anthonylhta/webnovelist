import { NextResponse } from "next/server";

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
