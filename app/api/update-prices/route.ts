import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKENS: Record<string, string> = {
  vim: process.env.GH_TOKEN_VIM || "",
  tvh: process.env.GH_TOKEN_TVH || "",
  tvp: process.env.GH_TOKEN_TVP || "",
};

const REPOS: Record<string, { owner: string; repo: string; path: string }> = {
  vim: { owner: "smokysapphire7-bot", repo: "vim-frontend", path: "src/lib/products.ts" },
  tvh: { owner: "ashilksdofficial-hash", repo: "tvh-frontend", path: "lib/products.ts" },
  tvp: { owner: "ashilksdofficial-hash", repo: "tvp-frontend", path: "lib/products.ts" },
};

async function getFile(site: string) {
  const { owner, repo, path } = REPOS[site];
  const token = GITHUB_TOKENS[site];
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: "token " + token, Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { sha: data.sha, content };
}

function updatePrices(content: string, prices: Record<string, number>): string {
  let updated = content;
  for (const [key, price] of Object.entries(prices)) {
    const mrp = Math.round(price * 1.25);
    const priceFormatted = "\u20b9" + price.toLocaleString("en-IN");
    const mrpFormatted = "\u20b9" + mrp.toLocaleString("en-IN");
    const priceRegex = new RegExp(`(slug:\s*["\']${key}["\'][^}]*?price:\s*["\'])([^"\']*)["\']`, "s");
    updated = updated.replace(priceRegex, `$1${priceFormatted}"`);
    const mrpRegex = new RegExp(`(slug:\s*["\']${key}["\'][^}]*?mrp:\s*["\'])([^"\']*)["\']`, "s");
    updated = updated.replace(mrpRegex, `$1${mrpFormatted}"`);
  }
  return updated;
}

async function pushFile(site: string, sha: string, content: string) {
  const { owner, repo, path } = REPOS[site];
  const token = GITHUB_TOKENS[site];
  const encoded = Buffer.from(content).toString("base64");
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: "token " + token, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update prices via admin panel — " + new Date().toLocaleDateString(),
      content: encoded,
      sha,
    }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  const { sites, prices } = await req.json();
  const results: Record<string, string> = {};

  for (const site of sites) {
    try {
      const file = await getFile(site);
      if (!file) { results[site] = "failed to read file"; continue; }
      const updated = updatePrices(file.content, prices);
      const pushed = await pushFile(site, file.sha, updated);
      results[site] = pushed ? "success" : "commit failed";
    } catch (e) {
      results[site] = "error: " + String(e);
    }
  }

  return NextResponse.json({ results });
}
