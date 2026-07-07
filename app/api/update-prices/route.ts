import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKENS: Record<string, string> = {
  vim: process.env.GH_TOKEN_VIM || "",
  tvh: process.env.GH_TOKEN_TVH || "",
  tvp: process.env.GH_TOKEN_TVP || "",
  vdb: process.env.GH_TOKEN_VDB || "",
};

const REPOS: Record<string, { owner: string; repo: string; path: string }> = {
  vim: { owner: "smokysapphire7-bot", repo: "vim-frontend", path: "src/lib/products.ts" },
  tvh: { owner: "ashilksdofficial-hash", repo: "tvh-frontend", path: "lib/products.ts" },
  tvp: { owner: "ashilksdofficial-hash", repo: "tvp-frontend", path: "lib/products.ts" },
  vdb: { owner: "yousufsahad918-cell", repo: "vdb-frontend", path: "src/lib/products.ts" },
};

async function getFile(site: string) {
  const { owner, repo, path } = REPOS[site];
  const token = GITHUB_TOKENS[site];
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: "token " + token, Accept: "application/vnd.github.v3+json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { sha: data.sha, content };
}

function formatPrice(num: number): string {
  return "\u20b9" + num.toLocaleString("en-IN");
}

function updatePrices(content: string, prices: Record<string, number>): string {
  let updated = content;

  for (const [key, price] of Object.entries(prices)) {
    const mrp = Math.round(price * 1.25);
    const priceStr = formatPrice(price);
    const mrpStr = formatPrice(mrp);

    // Split into product blocks and update the right one
    // Format: slug: "elfbar-600",\n    puffs: ...\n    price: "₹1,199"
    const slugPattern = `slug: "${key}"`;
    const slugIdx = updated.indexOf(slugPattern);
    if (slugIdx === -1) continue;

    // Find the price field after the slug (within next 800 chars)
    const block = updated.substring(slugIdx, slugIdx + 800);

    // Replace price
    const newBlock = block
      .replace(/(price:\s*")[^"]+(")/,  `$1${priceStr}$2`)
      .replace(/(originalPrice:\s*")[^"]+(")/,  `$1${mrpStr}$2`);

    updated = updated.substring(0, slugIdx) + newBlock + updated.substring(slugIdx + 800);
  }

  return updated;
}

async function pushFile(site: string, sha: string, content: string, message: string) {
  const { owner, repo, path } = REPOS[site];
  const token = GITHUB_TOKENS[site];
  const encoded = Buffer.from(content).toString("base64");
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: "token " + token,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, content: encoded, sha }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error("GitHub push error:", err);
  }
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const { sites, prices } = await req.json();
    const results: Record<string, string> = {};

    for (const site of sites) {
      try {
        const file = await getFile(site);
        if (!file) {
          results[site] = "failed to read file — check token";
          continue;
        }

        const updated = updatePrices(file.content, prices);

        if (updated === file.content) {
          results[site] = "no changes detected — slugs may not match";
          continue;
        }

        const pushed = await pushFile(
          site, file.sha, updated,
          `Update prices via admin panel — ${new Date().toLocaleDateString("en-IN")}`
        );

        results[site] = pushed ? "success" : "commit failed";
      } catch (e) {
        results[site] = "error: " + String(e);
      }
    }

    return NextResponse.json({ results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
