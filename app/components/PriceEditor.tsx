"use client";
import { useState, useEffect } from "react";

const GITHUB_TOKENS: Record<string, string> = {
  vim: process.env.NEXT_PUBLIC_GH_TOKEN_VIM || "",
  tvh: process.env.NEXT_PUBLIC_GH_TOKEN_TVH || "",
  tvp: process.env.NEXT_PUBLIC_GH_TOKEN_TVP || "",
};

const REPOS: Record<string, { owner: string; repo: string; path: string }> = {
  vim: { owner: "smokysapphire7-bot", repo: "vim-frontend", path: "src/lib/products.ts" },
  tvh: { owner: "ashilksdofficial-hash", repo: "tvh-frontend", path: "lib/products.ts" },
  tvp: { owner: "ashilksdofficial-hash", repo: "tvp-frontend", path: "lib/products.ts" },
};

const HOOKS: Record<string, string> = {
  vim: process.env.NEXT_PUBLIC_HOOK_VIM || "",
  tvh: process.env.NEXT_PUBLIC_HOOK_TVH || "",
  tvp: process.env.NEXT_PUBLIC_HOOK_TVP || "",
};

export const PRODUCTS = [
  { name: "Elfbar 600", key: "elfbar-600", price: 1199 },
  { name: "Elfbar Raya D1", key: "elfbar-raya-d1", price: 2399 },
  { name: "Elfbar MoonNight 40K", key: "elfbar-moonnight-40k", price: 3299 },
  { name: "Elfbar Raya D3", key: "elfbar-raya-d3", price: 2999 },
  { name: "Elfbar D3 Pro", key: "elfbar-d3-pro", price: 3199 },
  { name: "Elfbar Ice King", key: "elfbar-ice-king", price: 3199 },
  { name: "Elfbar Raya SOBO", key: "elfbar-raya-sobo", price: 3299 },
  { name: "Elfbar Trio", key: "elfbar-trio", price: 3199 },
  { name: "Elfbar BC 10000", key: "elfbar-bc-10000", price: 2199 },
  { name: "Lost Mary MT35000", key: "lost-mary-mt35000", price: 3199 },
  { name: "Lost Mary MO10000", key: "lost-mary-mo10000", price: 2199 },
  { name: "Nasty Bolt WTF 50K", key: "nasty-bolt-wtf-50k", price: 3499 },
  { name: "IGET Astro B18000", key: "iget-astro-b18000", price: 2499 },
  { name: "Yuoto Beyonder", key: "yuoto-beyonder", price: 2199 },
  { name: "Yuoto Thanos", key: "yuoto-thanos", price: 1999 },
  { name: "Elfliq Nic Salt 30ml", key: "elfliq-nic-salts", price: 1999 },
  { name: "Pod Salt Core 30ml", key: "pod-salt-core-nic-salt-30ml", price: 1999 },
  { name: "Nasty Salt 30ml", key: "nasty-salt-30ml", price: 1899 },
  { name: "ZYN Cool Mint", key: "zyn-cool-mint", price: 1299 },
  { name: "Velo Peppermint", key: "velo-freezing-peppermint", price: 1299 },
  { name: "Amber Leaf Tobacco", key: "amber-leaf-rolling-tobacco", price: 1199 },
  { name: "Caliburn KOKO GK3", key: "caliburn-koko-gk3", price: 6299 },
  { name: "Caliburn G3 Lite", key: "caliburn-g3-lite", price: 4599 },
  { name: "Caliburn G3 Pro", key: "caliburn-g3-pro", price: 7999 },
  { name: "Caliburn G4", key: "caliburn-g4", price: 7499 },
  { name: "Caliburn G4 Mini", key: "caliburn-g4-mini", price: 5499 },
  { name: "Caliburn G4 Pro", key: "caliburn-g4-pro", price: 7199 },
  { name: "Caliburn G5 Lite", key: "caliburn-g5-lite", price: 5699 },
  { name: "Caliburn GK2", key: "caliburn-gk2", price: 5800 },
  { name: "Caliburn A2", key: "caliburn-a2", price: 5899 },
  { name: "Caliburn Xpod", key: "caliburn-xpod", price: 6500 },
];

type PriceMap = Record<string, number>;

async function getFileSHA(site: string, token: string): Promise<{ sha: string; content: string } | null> {
  const { owner, repo, path } = REPOS[site];
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: "token " + token, Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = atob(data.content.replace(/\n/g, ""));
  return { sha: data.sha, content };
}

function updatePricesInContent(content: string, prices: PriceMap): string {
  let updated = content;
  for (const [key, price] of Object.entries(prices)) {
    const mrp = Math.round(price * 1.25);
    // Match price patterns like: price: "₹2,399"  or  price: "₹1,199"
    const priceRegex = new RegExp(`(slug:\s*"${key}"[^}]*?price:\s*")[^"]*(")`,"s");
    updated = updated.replace(priceRegex, `$1₹${price.toLocaleString("en-IN")}$2`);
    // Match mrp patterns
    const mrpRegex = new RegExp(`(slug:\s*"${key}"[^}]*?mrp:\s*")[^"]*(")`,"s");
    updated = updated.replace(mrpRegex, `$1₹${mrp.toLocaleString("en-IN")}$2`);
  }
  return updated;
}

async function pushFileToGitHub(site: string, token: string, sha: string, newContent: string, message: string): Promise<boolean> {
  const { owner, repo, path } = REPOS[site];
  const encoded = btoa(unescape(encodeURIComponent(newContent)));
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { Authorization: "token " + token, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: encoded, sha }),
  });
  return res.ok;
}

type Props = { onDeploy: () => void; onToast: (msg: string) => void; };

export default function PriceEditor({ onDeploy, onToast }: Props) {
  const [prices, setPrices] = useState<PriceMap>(() => {
    const p: PriceMap = {};
    PRODUCTS.forEach(prod => { p[prod.key] = prod.price; });
    return p;
  });
  const [activeSite, setActiveSite] = useState("all");
  const [saving, setSaving] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));

  const updatePrice = (key: string, val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""));
    if (!isNaN(num)) setPrices(prev => ({ ...prev, [key]: num }));
  };

  const getCategories = () => [
    { cat: "Disposables", items: PRODUCTS.slice(0, 15) },
    { cat: "E-Liquids & Pouches", items: PRODUCTS.slice(15, 21) },
    { cat: "Caliburn Pod Systems", items: PRODUCTS.slice(21) },
  ];

  const handleSaveAndDeploy = async () => {
    setSaving(true);
    const sites = activeSite === "all" ? ["vim", "tvh", "tvp"] : [activeSite];
    let successCount = 0;

    for (const site of sites) {
      try {
        addLog(`Reading ${site.toUpperCase()} products.ts...`);
        const token = GITHUB_TOKENS[site];
        const file = await getFileSHA(site, token);

        if (!file) {
          addLog(`✗ Failed to read ${site.toUpperCase()} — check token`);
          continue;
        }

        addLog(`Updating prices in ${site.toUpperCase()}...`);
        const updatedContent = updatePricesInContent(file.content, prices);

        const pushed = await pushFileToGitHub(
          site, token, file.sha, updatedContent,
          `Update prices via admin panel — ${new Date().toLocaleDateString()}`
        );

        if (pushed) {
          addLog(`✓ ${site.toUpperCase()} prices updated and committed`);
          successCount++;
        } else {
          addLog(`✗ ${site.toUpperCase()} commit failed`);
        }
      } catch (e) {
        addLog(`✗ ${site.toUpperCase()} error: ${String(e)}`);
      }
    }

    if (successCount > 0) {
      addLog(`Vercel rebuilding ${successCount} site(s)...`);
      onToast(`${successCount} site(s) updated — rebuilding in ~60s`);
    } else {
      onToast("No sites updated — check logs");
    }

    setSaving(false);
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Price editor</h2>
        <p style={{ fontSize: 13, color: "#888" }}>Changes write directly to GitHub and trigger a rebuild</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {["all","vim","tvh","tvp"].map(s => (
          <button key={s} onClick={() => setActiveSite(s)} style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid " + (activeSite === s ? "#E23744" : "#e0e0e0"), background: activeSite === s ? "#FEF2F2" : "#fff", color: activeSite === s ? "#E23744" : "#555", fontWeight: activeSite === s ? 700 : 400, fontSize: 13 }}>
            {s === "all" ? "All sites" : s === "vim" ? "Mumbai" : s === "tvh" ? "Hyderabad" : "Pune"}
          </button>
        ))}
      </div>

      {getCategories().map(cat => (
        <div key={cat.cat} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem", color: "#0D0D0D" }}>{cat.cat}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {cat.items.map(item => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f9f9f9", borderRadius: 8, border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13, color: "#0D0D0D" }}>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "#888" }}>₹</span>
                  <input type="number" value={prices[item.key]} onChange={e => updatePrice(item.key, e.target.value)}
                    style={{ width: 80, textAlign: "right", padding: "4px 8px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSaveAndDeploy} disabled={saving} style={{ width: "100%", background: saving ? "#ccc" : "#E23744", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: saving ? "not-allowed" : "pointer" }}>
        {saving ? "⏳ Updating prices..." : "💾 Save prices and deploy " + (activeSite === "all" ? "all sites" : activeSite.toUpperCase())}
      </button>

      {log.length > 0 && (
        <div style={{ marginTop: "1rem", background: "#0D0D0D", borderRadius: 12, padding: "1rem" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 600 }}>Deploy log</div>
          {log.map((l, i) => (
            <div key={i} style={{ fontFamily: "monospace", fontSize: 12, color: l.includes("✓") ? "#25D366" : l.includes("✗") ? "#E23744" : "#aaa", marginBottom: 4 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
