"use client";
import { useState } from "react";

type Purchase = {
  id: string;
  date: string;
  supplier: string;
  product: string;
  qty: number;
  unitCost: number;
  totalCost: number;
  site: string;
  notes: string;
};

type Payout = {
  id: string;
  date: string;
  recipient: string;
  amount: number;
  type: string;
  notes: string;
};

const SAMPLE_PURCHASES: Purchase[] = [
  { id: "P001", date: "2026-07-05", supplier: "Elfbar Distributor", product: "Elfbar Raya D1", qty: 10, unitCost: 1800, totalCost: 18000, site: "VIM", notes: "" },
  { id: "P002", date: "2026-07-05", supplier: "Caliburn Distributor", product: "Caliburn G4", qty: 5, unitCost: 5500, totalCost: 27500, site: "TVH", notes: "" },
  { id: "P003", date: "2026-07-04", supplier: "ZYN Distributor", product: "ZYN Cool Mint", qty: 20, unitCost: 900, totalCost: 18000, site: "TVP", notes: "" },
];

const SAMPLE_PAYOUTS: Payout[] = [
  { id: "O001", date: "2026-07-06", recipient: "Delivery Partner", amount: 1500, type: "Delivery Cost", notes: "Porter charges" },
  { id: "O002", date: "2026-07-05", recipient: "Vercel", amount: 2400, type: "Hosting", notes: "Monthly hosting" },
  { id: "O003", date: "2026-07-04", recipient: "Staff", amount: 5000, type: "Salary", notes: "Weekly pay" },
];

const EMPTY_PURCHASE = { date: new Date().toISOString().split("T")[0], supplier: "", product: "", qty: "1", unitCost: "", site: "VIM", notes: "" };
const EMPTY_PAYOUT = { date: new Date().toISOString().split("T")[0], recipient: "", amount: "", type: "Delivery Cost", notes: "" };

type Props = { onToast: (msg: string) => void; };

export default function Purchases({ onToast }: Props) {
  const [activeTab, setActiveTab] = useState<"purchases" | "payouts">("purchases");
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem("vape_purchases");
      return saved ? JSON.parse(saved) : SAMPLE_PURCHASES;
    } catch { return SAMPLE_PURCHASES; }
  });
  const [payouts, setPayouts] = useState<Payout[]>(() => {
    try {
      const saved = localStorage.getItem("vape_payouts");
      return saved ? JSON.parse(saved) : SAMPLE_PAYOUTS;
    } catch { return SAMPLE_PAYOUTS; }
  });
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ ...EMPTY_PURCHASE });
  const [payoutForm, setPayoutForm] = useState({ ...EMPTY_PAYOUT });
  const [showResetP, setShowResetP] = useState(false);
  const [showResetO, setShowResetO] = useState(false);

  const updateP = (key: string, val: string) => setPurchaseForm(prev => ({ ...prev, [key]: val }));

  const deletePurchase = (id: string) => {
    setPurchases(prev => {
      const updated = prev.filter(p => p.id !== id);
      try { localStorage.setItem("vape_purchases", JSON.stringify(updated)); } catch {}
      return updated;
    });
    onToast("Purchase deleted");
  };

  const deletePayout = (id: string) => {
    setPayouts(prev => {
      const updated = prev.filter(p => p.id !== id);
      try { localStorage.setItem("vape_payouts", JSON.stringify(updated)); } catch {}
      return updated;
    });
    onToast("Payout deleted");
  };

  const downloadPurchases = () => {
    const headers = ["#","Date","Supplier","Product","Qty","Unit Cost","Total","Site","Notes"];
    const rows = purchases.map(p => [p.id, p.date, p.supplier, p.product, p.qty, p.unitCost, p.totalCost, p.site, p.notes]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vape_purchases_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click(); URL.revokeObjectURL(url);
    onToast("Purchases exported");
  };

  const downloadPayouts = () => {
    const headers = ["#","Date","Recipient","Type","Amount","Notes"];
    const rows = payouts.map(p => [p.id, p.date, p.recipient, p.type, p.amount, p.notes]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vape_payouts_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click(); URL.revokeObjectURL(url);
    onToast("Payouts exported");
  };
  const updateO = (key: string, val: string) => setPayoutForm(prev => ({ ...prev, [key]: val }));

  const addPurchase = () => {
    if (!purchaseForm.product || !purchaseForm.unitCost) { onToast("Fill product and unit cost"); return; }
    const qty = parseInt(purchaseForm.qty || "1");
    const unit = parseInt(purchaseForm.unitCost);
    const newP: Purchase = {
      id: "P" + String(purchases.length + 1).padStart(3, "0"),
      date: purchaseForm.date,
      supplier: purchaseForm.supplier || "—",
      product: purchaseForm.product,
      qty, unitCost: unit, totalCost: qty * unit,
      site: purchaseForm.site,
      notes: purchaseForm.notes,
    };
    setPurchases(prev => {
      const updated = [newP, ...prev];
      try { localStorage.setItem("vape_purchases", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setShowPurchaseForm(false);
    setPurchaseForm({ ...EMPTY_PURCHASE });
    onToast("Purchase logged");
  };

  const addPayout = () => {
    if (!payoutForm.recipient || !payoutForm.amount) { onToast("Fill recipient and amount"); return; }
    const newO: Payout = {
      id: "O" + String(payouts.length + 1).padStart(3, "0"),
      date: payoutForm.date,
      recipient: payoutForm.recipient,
      amount: parseInt(payoutForm.amount),
      type: payoutForm.type,
      notes: payoutForm.notes,
    };
    setPayouts(prev => {
      const updated = [newO, ...prev];
      try { localStorage.setItem("vape_payouts", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setShowPayoutForm(false);
    setPayoutForm({ ...EMPTY_PAYOUT });
    onToast("Payout logged");
  };

  const totalPurchases = purchases.reduce((s, p) => s + p.totalCost, 0);
  const totalPayouts = payouts.reduce((s, p) => s + p.amount, 0);
  const totalOutflow = totalPurchases + totalPayouts;

  const PAYOUT_TYPES = ["Delivery Cost", "Hosting", "Salary", "Marketing", "Packaging", "Other"];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Purchases & Payouts</h2>
        <p style={{ fontSize: 13, color: "#888" }}>Track what you spend — stock purchases and operational costs</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total purchases", value: "₹" + totalPurchases.toLocaleString("en-IN"), sub: purchases.length + " entries", color: "#E23744" },
          { label: "Total payouts", value: "₹" + totalPayouts.toLocaleString("en-IN"), sub: payouts.length + " entries", color: "#D97706" },
          { label: "Total outflow", value: "₹" + totalOutflow.toLocaleString("en-IN"), sub: "Purchases + payouts", color: "#0D0D0D" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {[["purchases", "🛒 Purchases"], ["payouts", "💸 Payouts"]].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id as "purchases" | "payouts")} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + (activeTab === id ? "#E23744" : "#e0e0e0"), background: activeTab === id ? "#FEF2F2" : "#fff", color: activeTab === id ? "#E23744" : "#555", fontWeight: activeTab === id ? 700 : 400, fontSize: 13 }}>
            {label}
          </button>
        ))}
      </div>

      {/* PURCHASES */}
      {activeTab === "purchases" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Stock purchases ({purchases.length})</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadPurchases} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>⬇ Export</button>
              <button onClick={() => setShowResetP(true)} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>🗑 Reset</button>
              <button onClick={() => setShowPurchaseForm(!showPurchaseForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13 }}>+ Add Purchase</button>
            </div>
          </div>

          {showResetP && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#E23744", fontWeight: 600 }}>Reset all purchase data?</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setPurchases([]); setShowResetP(false); try { localStorage.setItem("vape_purchases", JSON.stringify([])); } catch {} onToast("Purchases cleared"); }} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontWeight: 700, fontSize: 12 }}>Yes</button>
                <button onClick={() => setShowResetP(false)} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, padding: "5px 14px", fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          )}

          {showPurchaseForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: "1rem" }}>Log stock purchase</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Date</label>
                  <input type="date" value={purchaseForm.date} onChange={e => updateP("date", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Supplier</label>
                  <input value={purchaseForm.supplier} onChange={e => updateP("supplier", e.target.value)} placeholder="e.g. Elfbar Distributor" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Site</label>
                  <select value={purchaseForm.site} onChange={e => updateP("site", e.target.value)}>
                    <option>VIM</option><option>TVH</option><option>TVP</option><option>All</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Product *</label>
                  <input value={purchaseForm.product} onChange={e => updateP("product", e.target.value)} placeholder="e.g. Elfbar Raya D1" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Qty</label>
                  <input type="number" value={purchaseForm.qty} onChange={e => updateP("qty", e.target.value)} min="1" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Unit cost (₹) *</label>
                  <input type="number" value={purchaseForm.unitCost} onChange={e => updateP("unitCost", e.target.value)} placeholder="1800" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Total preview</label>
                  <div style={{ padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#E23744" }}>
                    ₹{purchaseForm.unitCost && purchaseForm.qty ? (parseInt(purchaseForm.unitCost) * parseInt(purchaseForm.qty || "1")).toLocaleString("en-IN") : "—"}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Notes</label>
                <input value={purchaseForm.notes} onChange={e => updateP("notes", e.target.value)} placeholder="Optional notes" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addPurchase} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowPurchaseForm(false); setPurchaseForm({ ...EMPTY_PURCHASE }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {purchases.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "2rem" }}>No purchases logged yet</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                    {["#","Date","Supplier","Product","Qty","Unit Cost","Total","Site","Notes",""].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 10px", color: "#aaa" }}>{p.id}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{p.date}</td>
                      <td style={{ padding: "8px 10px" }}>{p.supplier}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 500 }}>{p.product}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>{p.qty}</td>
                      <td style={{ padding: "8px 10px" }}>₹{p.unitCost.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#E23744" }}>₹{p.totalCost.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ background: "#FEF2F2", color: "#E23744", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{p.site}</span>
                      </td>
                      <td style={{ padding: "8px 10px", color: "#888" }}>{p.notes || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <button onClick={() => deletePurchase(p.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 8px", color: "#E23744", cursor: "pointer", fontSize: 12 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PAYOUTS */}
      {activeTab === "payouts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Payouts ({payouts.length})</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadPayouts} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>⬇ Export</button>
              <button onClick={() => setShowResetO(true)} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>🗑 Reset</button>
              <button onClick={() => setShowPayoutForm(!showPayoutForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13 }}>+ Add Payout</button>
            </div>
          </div>

          {showResetO && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#E23744", fontWeight: 600 }}>Reset all payout data?</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setPayouts([]); setShowResetO(false); try { localStorage.setItem("vape_payouts", JSON.stringify([])); } catch {} onToast("Payouts cleared"); }} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontWeight: 700, fontSize: 12 }}>Yes</button>
                <button onClick={() => setShowResetO(false)} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, padding: "5px 14px", fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          )}

          {showPayoutForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: "1rem" }}>Log payout</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Date</label>
                  <input type="date" value={payoutForm.date} onChange={e => updateO("date", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Recipient *</label>
                  <input value={payoutForm.recipient} onChange={e => updateO("recipient", e.target.value)} placeholder="e.g. Delivery Partner" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Type</label>
                  <select value={payoutForm.type} onChange={e => updateO("type", e.target.value)}>
                    {PAYOUT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Amount (₹) *</label>
                  <input type="number" value={payoutForm.amount} onChange={e => updateO("amount", e.target.value)} placeholder="1500" />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Notes</label>
                <input value={payoutForm.notes} onChange={e => updateO("notes", e.target.value)} placeholder="Optional notes" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addPayout} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowPayoutForm(false); setPayoutForm({ ...EMPTY_PAYOUT }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {payouts.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "2rem" }}>No payouts logged yet</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                    {["#","Date","Recipient","Type","Amount","Notes",""].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 10px", color: "#aaa" }}>{p.id}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{p.date}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 500 }}>{p.recipient}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ background: "#FFF9E6", color: "#D97706", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{p.type}</span>
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#D97706" }}>₹{p.amount.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", color: "#888" }}>{p.notes || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <button onClick={() => deletePayout(p.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 8px", color: "#E23744", cursor: "pointer", fontSize: 12 }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
