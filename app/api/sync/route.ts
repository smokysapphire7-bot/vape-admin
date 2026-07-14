import { NextRequest, NextResponse } from "next/server";

// Single JSONBin to store all sync codes
const JSONBIN_KEY = process.env.JSONBIN_KEY || "";
const SYNC_BIN_ID = process.env.SYNC_BIN_ID || "";
const BASE = "https://api.jsonbin.io/v3";

async function getSyncStore(): Promise<Record<string, {data: unknown, expires: number}>> {
  if (!SYNC_BIN_ID) return {};
  try {
    const res = await fetch(`${BASE}/b/${SYNC_BIN_ID}/latest`, {
      headers: { "X-Master-Key": JSONBIN_KEY },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.record || {};
  } catch { return {}; }
}

async function setSyncStore(store: Record<string, unknown>): Promise<boolean> {
  if (!SYNC_BIN_ID) return false;
  try {
    // Clean expired entries
    const now = Date.now();
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(store)) {
      if ((v as {expires: number}).expires > now) clean[k] = v;
    }
    const res = await fetch(`${BASE}/b/${SYNC_BIN_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
      body: JSON.stringify(clean),
    });
    return res.ok;
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const { action, code, data } = await req.json();

  if (action === "push") {
    const syncCode = String(Math.floor(100000 + Math.random() * 900000));
    const store = await getSyncStore();
    store[syncCode] = { data, expires: Date.now() + 24 * 60 * 60 * 1000 };
    const saved = await setSyncStore(store);
    if (saved) return NextResponse.json({ ok: true, code: syncCode });
    return NextResponse.json({ ok: false, error: "Failed to save sync data" });
  }

  if (action === "pull") {
    const store = await getSyncStore();
    const entry = store[String(code)] as { data: unknown; expires: number } | undefined;
    if (!entry || entry.expires < Date.now()) {
      return NextResponse.json({ ok: false, error: "Code expired or invalid" });
    }
    return NextResponse.json({ ok: true, data: entry.data });
  }

  return NextResponse.json({ ok: false, error: "Invalid action" });
}
