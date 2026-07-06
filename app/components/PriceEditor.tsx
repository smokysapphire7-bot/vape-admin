"use client";
import { useState } from "react";

const PRODUCTS = [
  { cat: "Disposables", items: [
    { name: "Elfbar 600", price: 1199 },
    { name: "Elfbar Raya D1", price: 2399 },
    { name: "Elfbar MoonNight 40K", price: 3299 },
    { name: "Elfbar Raya D3", price: 2999 },
    { name: "Elfbar D3 Pro", price: 3199 },
    { name: "Elfbar Ice King", price: 3199 },
    { name: "Elfbar Raya SOBO", price: 3299 },
    { name: "Elfbar Trio", price: 3199 },
    { name: "Elfbar BC 10000", price: 2199 },
    { name: "Lost Mary MT35000", price: 3199 },
    { name: "Lost Mary MO10000", price: 2199 },
    { name: "Nasty Bolt WTF 50K", price: 3499 },
    { name: "IGET Astro B18000", price: 2499 },
    { name: "Yuoto Beyonder", price: 2199 },
    { name: "Yuoto Thanos", price: 1999 },
  ]},
  { cat: "E-Liquids & Pouches", items: [
    { name: "Elfliq Nic Salt 30ml", price: 1999 },
    { name: "Pod Salt Core 30ml", price: 1999 },
    { name: "Nasty Salt 30ml", price: 1899 },
    { name: "ZYN Cool Mint", price: 1299 },
    { name: "Velo Freezing Peppermint", price: 1299 },
    { name: "Tobacco (all)", price: 1199 },
  ]},
  { cat: "Caliburn Pod Systems", items: [
    { name: "Caliburn KOKO GK3", price: 6299 },
    { name: "Caliburn G3 Lite", price: 4599 },
    { name: "Caliburn G3 Lite KOKO", price: 5999 },
    { name: "Caliburn G3 Pro", price: 7999 },
    { name: "Caliburn G3 Pro KOKO", price: 6999 },
    { name: "Caliburn G4", price: 7499 },
    { name: "Caliburn G4 Mini", price: 5499 },
    { name: "Caliburn G4 Pro", price: 7199 },
    { name: "Caliburn G4 Pro KOKO", price: 7599 },
    { name: "Caliburn G5 Lite", price: 5699 },
    { name: "Caliburn G5 Lite SE", price: 5999 },
    { name: "Caliburn G5 Lite KOKO", price: 6999 },
    { name: "Caliburn A2", price: 5899 },
    { name: "Caliburn GK2", price: 5800 },
    { name: "Caliburn Xpod", price: 6500 },
  ]},
];

type Props = { onDeploy: () => void; onToast: (msg: string) => void; };

export default function PriceEditor({ onDeploy, onToast }: Props) {
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    PRODUCTS.forEach(cat => cat.items.forEach(item => { p[item.name] = item.price; }));
    return p;
  });
  const [activeSite, setActiveSite] = useState("all");

  const updatePrice = (name: string, val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""));
    if (!isNaN(num)) setPrices(prev => ({ ...prev, [name]: num }));
  };

  const handleDeploy = async () => {
    onToast("Prices saved — deploying all sites...");
    await onDeploy();
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Price editor</h2>
        <p style={{ fontSize: 13, color: "#888" }}>Edit prices below then deploy all sites</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {["all", "vim", "tvh", "tvp"].map(s => (
          <button key={s} onClick={() => setActiveSite(s)} style={{ padding: "6px 16px", borderRadius: 20, border: "1px solid " + (activeSite === s ? "#E23744" : "#e0e0e0"), background: activeSite === s ? "#FEF2F2" : "#fff", color: activeSite === s ? "#E23744" : "#555", fontWeight: activeSite === s ? 700 : 400, fontSize: 13 }}>
            {s === "all" ? "All sites" : s === "vim" ? "Mumbai" : s === "tvh" ? "Hyderabad" : "Pune"}
          </button>
        ))}
      </div>

      {PRODUCTS.map(cat => (
        <div key={cat.cat} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem", color: "#0D0D0D" }}>{cat.cat}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {cat.items.map(item => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f9f9f9", borderRadius: 8, border: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13, color: "#0D0D0D" }}>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "#888" }}>₹</span>
                  <input type="number" value={prices[item.name]} onChange={e => updatePrice(item.name, e.target.value)}
                    style={{ width: 80, textAlign: "right", padding: "4px 8px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleDeploy} style={{ width: "100%", background: "#E23744", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        💾 Save prices and deploy all sites
      </button>
    </div>
  );
}
