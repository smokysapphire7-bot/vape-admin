import { NextRequest, NextResponse } from "next/server";

const HOOKS: Record<string, string> = {
  vim: process.env.HOOK_VIM || "",
  tvh: process.env.HOOK_TVH || "",
  tvp: process.env.HOOK_TVP || "",
  vdb: process.env.HOOK_VDB || "",
};

export async function POST(req: NextRequest) {
  const { sites } = await req.json();
  const results: Record<string, string> = {};

  for (const site of sites) {
    const hook = HOOKS[site];
    if (!hook) { results[site] = "no hook configured"; continue; }
    try {
      await fetch(hook, { method: "POST" });
      results[site] = "triggered";
    } catch {
      results[site] = "failed";
    }
  }

  return NextResponse.json({ results });
}
