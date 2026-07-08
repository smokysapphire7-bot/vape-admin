import { NextRequest, NextResponse } from "next/server";

// In-memory store (resets on cold start, but works for sync sessions)
const store = new Map<string, { data: string; expires: number }>();

// Clean expired entries
function cleanup() {
  const now = Date.now();
  for (const [key, val] of store.entries()) {
    if (val.expires < now) store.delete(key);
  }
}

export async function POST(req: NextRequest) {
  cleanup();
  const { action, code, data } = await req.json();

  if (action === "push") {
    // Generate 6-digit code, store data for 24 hours
    const syncCode = String(Math.floor(100000 + Math.random() * 900000));
    store.set(syncCode, { data: JSON.stringify(data), expires: Date.now() + 24 * 60 * 60 * 1000 });
    return NextResponse.json({ ok: true, code: syncCode });
  }

  if (action === "pull") {
    const entry = store.get(String(code));
    if (!entry || entry.expires < Date.now()) {
      return NextResponse.json({ ok: false, error: "Code expired or invalid" });
    }
    return NextResponse.json({ ok: true, data: JSON.parse(entry.data) });
  }

  return NextResponse.json({ ok: false, error: "Invalid action" });
}
