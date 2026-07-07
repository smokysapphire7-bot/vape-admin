"use client";
import { useState } from "react";

type Order = {
  id: string;
  date: string;
  site: string;
  product: string;
  qty: number;
  salePrice: number;
  purchasePrice: number;
  profit: number;
  status: string;
  stockType: "own" | "shop";
};

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

const EMPTY_ORDER = { site: "VIM", product: "Elfbar Raya D1", qty: "1", salePrice: "", purchasePrice: "", status: "Delivered", date: new Date().toISOString().split("T")[0], stockType: "own" as "own" | "shop" };
const EMPTY_PURCHASE = { date: new Date().toISOString().split("T")[0], supplier: "", product: "", qty: "1", unitCost: "", site: "VIM", notes: "" };
const EMPTY_PAYOUT = { date: new Date().toISOString().split("T")[0], recipient: "", amount: "", type: "Delivery Cost", notes: "" };

const PRODUCTS = [
  "Elfbar 600","Elfbar Raya D1","Elfbar MoonNight 40K","Elfbar Raya D3","Elfbar D3 Pro",
  "Elfbar Ice King","Elfbar SOBO","Elfbar Trio","Elfbar BC10000","Lost Mary MT35000",
  "Lost Mary MO10000","Nasty Bolt WTF 50K","IGET Astro B18K","Yuoto Beyonder","Yuoto Thanos",
  "Elfliq Nic Salt","Pod Salt Core","Nasty Salt","ZYN Cool Mint","Velo Peppermint",
  "Tobacco","Caliburn G3 Pro","Caliburn G4","Caliburn G4 Pro","Caliburn G5 Lite","Caliburn GK2",
];

const PAYOUT_TYPES = ["Delivery Cost","Hosting","Salary","Marketing","Packaging","Other"];

type Props = { onToast: (msg: string) => void; };

export default function Accounts({ onToast }: Props) {
  const [subTab, setSubTab] = useState<"orders"|"purchases"|"payouts">("orders");
  const [filterSite, setFilterSite] = useState("all");

  const [orders, setOrders] = useState<Order[]>(() => {
    try { const s = localStorage.getItem("vape_orders"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try { const s = localStorage.getItem("vape_purchases"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [payouts, setPayouts] = useState<Payout[]>(() => {
    try { const s = localStorage.getItem("vape_payouts"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const [orderForm, setOrderForm] = useState({ ...EMPTY_ORDER });
  const [purchaseForm, setPurchaseForm] = useState({ ...EMPTY_PURCHASE });
  const [payoutForm, setPayoutForm] = useState({ ...EMPTY_PAYOUT });

  const updateO = (k: string, v: string) => setOrderForm(p => ({ ...p, [k]: v }));
  const updateP = (k: string, v: string) => setPurchaseForm(p => ({ ...p, [k]: v }));
  const updatePO = (k: string, v: string) => setPayoutForm(p => ({ ...p, [k]: v }));

  const save = (key: string, data: unknown[]) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  };

  const addOrder = () => {
    if (!orderForm.salePrice) { onToast("Enter sale price"); return; }
    const sale = parseInt(orderForm.salePrice);
    const purchase = parseInt(orderForm.purchasePrice || "0");
    const qty = parseInt(orderForm.qty || "1");
    const newOrder: Order = {
      id: String(orders.length + 1).padStart(3, "0"),
      date: orderForm.date,
      site: orderForm.site,
      product: orderForm.product,
      qty,
      salePrice: sale * qty,
      purchasePrice: purchase * qty,
      profit: (sale - purchase) * qty,
      status: orderForm.status,
      stockType: orderForm.stockType as "own" | "shop",
    };
    const updated = [newOrder, ...orders];
    setOrders(updated); save("vape_orders", updated);
    setShowOrderForm(false); setOrderForm({ ...EMPTY_ORDER });
    onToast("Order logged");
  };

  const addPurchase = () => {
    if (!purchaseForm.product || !purchaseForm.unitCost) { onToast("Fill product and cost"); return; }
    const qty = parseInt(purchaseForm.qty || "1");
    const unit = parseInt(purchaseForm.unitCost);
    const np: Purchase = {
      id: "P" + String(purchases.length + 1).padStart(3, "0"),
      date: purchaseForm.date,
      supplier: purchaseForm.supplier || "—",
      product: purchaseForm.product,
      qty, unitCost: unit, totalCost: qty * unit,
      site: purchaseForm.site,
      notes: purchaseForm.notes,
    };
    const updated = [np, ...purchases];
    setPurchases(updated); save("vape_purchases", updated);
    setShowPurchaseForm(false); setPurchaseForm({ ...EMPTY_PURCHASE });
    onToast("Purchase logged");
  };

  const addPayout = () => {
    if (!payoutForm.recipient || !payoutForm.amount) { onToast("Fill recipient and amount"); return; }
    const np: Payout = {
      id: "O" + String(payouts.length + 1).padStart(3, "0"),
      date: payoutForm.date,
      recipient: payoutForm.recipient,
      amount: parseInt(payoutForm.amount),
      type: payoutForm.type,
      notes: payoutForm.notes,
    };
    const updated = [np, ...payouts];
    setPayouts(updated); save("vape_payouts", updated);
    setShowPayoutForm(false); setPayoutForm({ ...EMPTY_PAYOUT });
    onToast("Payout logged");
  };

  const deleteOrder = (id: string) => { const u = orders.filter(o => o.id !== id); setOrders(u); save("vape_orders", u); onToast("Deleted"); };
  const deletePurchase = (id: string) => { const u = purchases.filter(p => p.id !== id); setPurchases(u); save("vape_purchases", u); onToast("Deleted"); };
  const deletePayout = (id: string) => { const u = payouts.filter(p => p.id !== id); setPayouts(u); save("vape_payouts", u); onToast("Deleted"); };

  const resetAll = () => {
    setOrders([]); setPurchases([]); setPayouts([]);
    save("vape_orders", []); save("vape_purchases", []); save("vape_payouts", []);
    setShowReset(false); onToast("All data cleared");
  };

  const downloadCSV = (filename: string, headers: string[], rows: (string|number)[][]) => {
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = filename + "_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click(); onToast("Exported");
  };

  const filtered = filterSite === "all" ? orders : orders.filter(o => o.site === filterSite);
  const totalSale = filtered.reduce((s, o) => s + o.salePrice, 0);
  const totalProfit = filtered.reduce((s, o) => s + o.profit, 0);
  const totalPurchases = purchases.reduce((s, p) => s + p.totalCost, 0);
  const totalPayouts = payouts.reduce((s, p) => s + p.amount, 0);
  const margin = totalSale > 0 ? Math.round((totalProfit / totalSale) * 100) : 0;

  const siteRev: Record<string, number> = { VIM: 0, TVH: 0, TVP: 0, VDB: 0 };
  const sitePro: Record<string, number> = { VIM: 0, TVH: 0, TVP: 0, VDB: 0 };
  orders.forEach(o => { siteRev[o.site] = (siteRev[o.site] || 0) + o.salePrice; sitePro[o.site] = (sitePro[o.site] || 0) + o.profit; });
  const totalAll = Object.values(siteRev).reduce((a, b) => a + b, 0);

  const badge = (text: string, bg: string, color: string) => (
    <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{text}</span>
  );

  const delBtn = (onClick: () => void) => (
    <button onClick={onClick} style={{ background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 8px", color: "#E23744", cursor: "pointer", fontSize: 12 }}>✕</button>
  );

  const label = (text: string) => <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{text}</label>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Accounts & Sales</h2>
          <p style={{ fontSize: 13, color: "#888" }}>Track orders, purchases and payouts</p>
        </div>
        <button onClick={() => setShowReset(true)} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13 }}>🗑 Reset All Data</button>
      </div>

      {showReset && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#E23744" }}>Reset all data?</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Clears all orders, purchases and payouts. Cannot be undone.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetAll} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontWeight: 700, fontSize: 12 }}>Yes, reset all</button>
            <button onClick={() => setShowReset(false)} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, padding: "5px 14px", fontSize: 12 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total revenue", value: "₹" + totalAll.toLocaleString("en-IN"), sub: orders.length + " orders", color: "#0D0D0D" },
          { label: "Total profit", value: "₹" + totalProfit.toLocaleString("en-IN"), sub: margin + "% margin", color: "#059669" },
          { label: "Total outflow", value: "₹" + (totalPurchases + totalPayouts).toLocaleString("en-IN"), sub: "Purchases + payouts", color: "#E23744" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {([["orders","📋 Orders"],["purchases","🛒 Purchases"],["payouts","💸 Payouts"]] as [string,string][]).map(([id, lbl]) => (
          <button key={id} onClick={() => setSubTab(id as "orders"|"purchases"|"payouts")} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + (subTab === id ? "#E23744" : "#e0e0e0"), background: subTab === id ? "#FEF2F2" : "#fff", color: subTab === id ? "#E23744" : "#555", fontWeight: subTab === id ? 700 : 400, fontSize: 13 }}>{lbl}</button>
        ))}
      </div>

      {/* ORDERS */}
      {subTab === "orders" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["all","VIM","TVH","TVP","VDB"].map(s => (
                <button key={s} onClick={() => setFilterSite(s)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid " + (filterSite === s ? "#E23744" : "#e0e0e0"), background: filterSite === s ? "#FEF2F2" : "#fff", color: filterSite === s ? "#E23744" : "#555", fontSize: 12, fontWeight: filterSite === s ? 700 : 400 }}>{s === "all" ? "All" : s === "VIM" ? "Mumbai" : s === "TVH" ? "Hyderabad" : s === "TVP" ? "Pune" : "Bangalore"}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => downloadCSV("orders", ["#","Date","Site","Product","Qty","Sale","Purchase","Profit","Status"], filtered.map(o => [o.id,o.date,o.site,o.product,o.qty,o.salePrice,o.purchasePrice,o.profit,o.status]))} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>⬇ Export</button>
              <button onClick={() => setShowOrderForm(!showOrderForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13 }}>+ Log Order</button>
            </div>
          </div>

          {showOrderForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Date")}<input type="date" value={orderForm.date} onChange={e => updateO("date", e.target.value)} /></div>
                <div>{label("Site")}<select value={orderForm.site} onChange={e => updateO("site", e.target.value)}><option value="VIM">Mumbai</option><option value="TVH">Hyderabad</option><option value="TVP">Pune</option><option value="VDB">Bangalore</option></select></div>
                <div>{label("Product")}<select value={orderForm.product} onChange={e => updateO("product", e.target.value)}>{PRODUCTS.map(p => <option key={p}>{p}</option>)}</select></div>
                <div>{label("Qty")}<input type="number" value={orderForm.qty} onChange={e => updateO("qty", e.target.value)} min="1" /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Sale price / unit (₹)")}<input type="number" value={orderForm.salePrice} onChange={e => updateO("salePrice", e.target.value)} placeholder="2399" /></div>
                <div>{label("Purchase price / unit (₹)")}<input type="number" value={orderForm.purchasePrice} onChange={e => updateO("purchasePrice", e.target.value)} placeholder="1800" /></div>
                <div>{label("Profit preview")}<div style={{ padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#059669" }}>₹{orderForm.salePrice && orderForm.purchasePrice ? ((parseInt(orderForm.salePrice) - parseInt(orderForm.purchasePrice)) * parseInt(orderForm.qty || "1")).toLocaleString("en-IN") : "—"}</div></div>
                <div>{label("Status")}<select value={orderForm.status} onChange={e => updateO("status", e.target.value)}><option>Delivered</option><option>Pending</option><option>Cancelled</option></select></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Stock type</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[["own", "Own Stock", "Lower cost — bought in advance", "#059669"], ["shop", "Shop Stock", "Higher cost — bought same day", "#D97706"]].map(([val, label2, desc, color]) => (
                    <div key={val} onClick={() => updateO("stockType", val)} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "2px solid " + (orderForm.stockType === val ? color : "#e0e0e0"), background: orderForm.stockType === val ? color + "11" : "#fff", cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: orderForm.stockType === val ? color : "#555" }}>{label2}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addOrder} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowOrderForm(false); setOrderForm({ ...EMPTY_ORDER }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {filtered.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "2rem" }}>No orders yet</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: "1px solid #e0e0e0" }}>{["#","Date","Site","Product","Qty","Sale","Purchase","Profit","Stock","Status",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>{filtered.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 10px", color: "#aaa" }}>{o.id}</td>
                      <td style={{ padding: "8px 10px" }}>{o.date}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(o.site === "VIM" ? "Mumbai" : o.site === "TVH" ? "Hyderabad" : o.site === "TVP" ? "Pune" : o.site === "VDB" ? "Bangalore" : o.site, "#FEF2F2", "#E23744")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 500 }}>{o.product}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" }}>{o.qty}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>₹{o.salePrice.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", color: "#888" }}>₹{o.purchasePrice.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#059669" }}>₹{o.profit.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(o.stockType === "own" ? "Own" : "Shop", o.stockType === "own" ? "#e8faf0" : "#FFF9E6", o.stockType === "own" ? "#059669" : "#D97706")}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(o.status, o.status==="Delivered"?"#e8faf0":o.status==="Pending"?"#FFF9E6":"#FEF2F2", o.status==="Delivered"?"#059669":o.status==="Pending"?"#D97706":"#E23744")}</td>
                      <td style={{ padding: "8px 10px" }}>{delBtn(() => deleteOrder(o.id))}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PURCHASES */}
      {subTab === "purchases" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Stock purchases ({purchases.length}) — Total ₹{totalPurchases.toLocaleString("en-IN")}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => downloadCSV("purchases", ["#","Date","Supplier","Product","Qty","Unit Cost","Total","Site","Notes"], purchases.map(p => [p.id,p.date,p.supplier,p.product,p.qty,p.unitCost,p.totalCost,p.site,p.notes]))} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>⬇ Export</button>
              <button onClick={() => { setPurchases([]); save("vape_purchases", []); onToast("Purchases cleared"); }} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>🗑 Reset</button>
              <button onClick={() => setShowPurchaseForm(!showPurchaseForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13 }}>+ Add</button>
            </div>
          </div>

          {showPurchaseForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Date")}<input type="date" value={purchaseForm.date} onChange={e => updateP("date", e.target.value)} /></div>
                <div>{label("Supplier")}<input value={purchaseForm.supplier} onChange={e => updateP("supplier", e.target.value)} placeholder="Elfbar Distributor" /></div>
                <div>{label("Site")}<select value={purchaseForm.site} onChange={e => updateP("site", e.target.value)}><option>VIM</option><option>TVH</option><option>TVP</option><option>All</option></select></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>{label("Product *")}<input value={purchaseForm.product} onChange={e => updateP("product", e.target.value)} placeholder="Elfbar Raya D1" /></div>
                <div>{label("Qty")}<input type="number" value={purchaseForm.qty} onChange={e => updateP("qty", e.target.value)} min="1" /></div>
                <div>{label("Unit cost (₹)")}<input type="number" value={purchaseForm.unitCost} onChange={e => updateP("unitCost", e.target.value)} placeholder="1800" /></div>
                <div>{label("Total")}<div style={{ padding: "8px 12px", background: "#FEF2F2", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#E23744" }}>₹{purchaseForm.unitCost && purchaseForm.qty ? (parseInt(purchaseForm.unitCost) * parseInt(purchaseForm.qty || "1")).toLocaleString("en-IN") : "—"}</div></div>
              </div>
              <div style={{ marginBottom: 12 }}>{label("Notes")}<input value={purchaseForm.notes} onChange={e => updateP("notes", e.target.value)} placeholder="Optional" /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addPurchase} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowPurchaseForm(false); setPurchaseForm({ ...EMPTY_PURCHASE }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {purchases.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "2rem" }}>No purchases logged yet</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "1px solid #e0e0e0" }}>{["#","Date","Supplier","Product","Qty","Unit Cost","Total","Site","Notes",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12 }}>{h}</th>)}</tr></thead>
                <tbody>{purchases.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "8px 10px", color: "#aaa" }}>{p.id}</td>
                    <td style={{ padding: "8px 10px" }}>{p.date}</td>
                    <td style={{ padding: "8px 10px" }}>{p.supplier}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 500 }}>{p.product}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>{p.qty}</td>
                    <td style={{ padding: "8px 10px" }}>₹{p.unitCost.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#E23744" }}>₹{p.totalCost.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px" }}>{badge(p.site, "#FEF2F2", "#E23744")}</td>
                    <td style={{ padding: "8px 10px", color: "#888" }}>{p.notes || "—"}</td>
                    <td style={{ padding: "8px 10px" }}>{delBtn(() => deletePurchase(p.id))}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PAYOUTS */}
      {subTab === "payouts" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Payouts ({payouts.length}) — Total ₹{totalPayouts.toLocaleString("en-IN")}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => downloadCSV("payouts", ["#","Date","Recipient","Type","Amount","Notes"], payouts.map(p => [p.id,p.date,p.recipient,p.type,p.amount,p.notes]))} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>⬇ Export</button>
              <button onClick={() => { setPayouts([]); save("vape_payouts", []); onToast("Payouts cleared"); }} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12 }}>🗑 Reset</button>
              <button onClick={() => setShowPayoutForm(!showPayoutForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13 }}>+ Add</button>
            </div>
          </div>

          {showPayoutForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Date")}<input type="date" value={payoutForm.date} onChange={e => updatePO("date", e.target.value)} /></div>
                <div>{label("Recipient *")}<input value={payoutForm.recipient} onChange={e => updatePO("recipient", e.target.value)} placeholder="Delivery Partner" /></div>
                <div>{label("Type")}<select value={payoutForm.type} onChange={e => updatePO("type", e.target.value)}>{PAYOUT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div>{label("Amount (₹) *")}<input type="number" value={payoutForm.amount} onChange={e => updatePO("amount", e.target.value)} placeholder="1500" /></div>
              </div>
              <div style={{ marginBottom: 12 }}>{label("Notes")}<input value={payoutForm.notes} onChange={e => updatePO("notes", e.target.value)} placeholder="Optional" /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addPayout} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13 }}>Save</button>
                <button onClick={() => { setShowPayoutForm(false); setPayoutForm({ ...EMPTY_PAYOUT }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {payouts.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "2rem" }}>No payouts logged yet</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "1px solid #e0e0e0" }}>{["#","Date","Recipient","Type","Amount","Notes",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12 }}>{h}</th>)}</tr></thead>
                <tbody>{payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "8px 10px", color: "#aaa" }}>{p.id}</td>
                    <td style={{ padding: "8px 10px" }}>{p.date}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 500 }}>{p.recipient}</td>
                    <td style={{ padding: "8px 10px" }}>{badge(p.type, "#FFF9E6", "#D97706")}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#D97706" }}>₹{p.amount.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", color: "#888" }}>{p.notes || "—"}</td>
                    <td style={{ padding: "8px 10px" }}>{delBtn(() => deletePayout(p.id))}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
