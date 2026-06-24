import { NextResponse } from "next/server";
import { readState, writeState } from "@/lib/storage";
import { isValidAppState } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidAppState(body)) {
    return NextResponse.json({ ok: false, error: "invalid_state" }, { status: 400 });
  }

  await writeState(body);
  return NextResponse.json({ ok: true });
}
