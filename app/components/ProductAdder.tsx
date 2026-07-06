"use client";
import { useState } from "react";

type Props = { onDeploy: () => void; onToast: (msg: string) => void; };

export default function ProductAdder({ onDeploy, onToast }: Props) {
  const [form, setForm] = useState({
    name: "", brand: "Elfbar", category: "Disposable Vape",
    badge: "NEW", puffs: "", nicotine: "20mg Nicotine Salt",
    price: "", originalPrice: "", description: "",
  });
  const [sites, setSites] = useState({ vim: true, tvh: true, tvp: true });
  const [imgPreview, setImgPreview] = useState("");

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImgPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!form.name || !form.price) { onToast("Please fill in product name and price"); return; }
    onToast("Product added — deploying selected sites...");
    await onDeploy();
    setForm({ name: "", brand: "Elfbar", category: "Disposable Vape", badge: "NEW", puffs: "", nicotine: "20mg Nicotine Salt", price: "", originalPrice: "", description: "" });
    setImgPreview("");
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Add product</h2>
        <p style={{ fontSize: 13, color: "#888" }}>New products are hardcoded on save</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Product name *</label>
            <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Elfbar Raya D5" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Brand</label>
            <select value={form.brand} onChange={e => update("brand", e.target.value)}>
              {["Elfbar","Lost Mary","Nasty","IGET","Yuoto","Caliburn","Other"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Category</label>
            <select value={form.category} onChange={e => update("category", e.target.value)}>
              {["Disposable Vape","Pod System","E-Liquid","Nicotine Pouch","Tobacco"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Badge</label>
            <input value={form.badge} onChange={e => update("badge", e.target.value)} placeholder="e.g. NEW, BEST SELLER" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Puff count</label>
            <input value={form.puffs} onChange={e => update("puffs", e.target.value)} placeholder="e.g. 15,000 Puffs" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Nicotine</label>
            <input value={form.nicotine} onChange={e => update("nicotine", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => update("price", e.target.value)} placeholder="2399" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Original price (₹)</label>
            <input type="number" value={form.originalPrice} onChange={e => update("originalPrice", e.target.value)} placeholder="2999" />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Short description</label>
          <input value={form.description} onChange={e => update("description", e.target.value)} placeholder="e.g. Smart display · 15,000 puffs · Type-C" />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Product image</label>
          <label style={{ display: "block", border: "1px dashed #ccc", borderRadius: 8, padding: "1rem", textAlign: "center", cursor: "pointer", background: "#f9f9f9" }}>
            {imgPreview ? <img src={imgPreview} alt="preview" style={{ width: 80, height: 80, objectFit: "contain" }} /> : (
              <>
                <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>📷</span>
                <span style={{ fontSize: 13, color: "#888" }}>Click to upload product image</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Add to sites</label>
          <div style={{ display: "flex", gap: 16 }}>
            {[["vim","Mumbai"], ["tvh","Hyderabad"], ["tvp","Pune"]].map(([key, label]) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={sites[key as keyof typeof sites]} onChange={e => setSites(prev => ({ ...prev, [key]: e.target.checked }))} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button onClick={handleAdd} style={{ width: "100%", background: "#E23744", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14 }}>
          ➕ Add product and deploy
        </button>
      </div>
    </div>
  );
}
