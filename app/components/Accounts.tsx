"use client";
import { useState, useEffect } from "react";

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
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [orderForm, setOrderForm] = useState({ ...EMPTY_ORDER });
  const [purchaseForm, setPurchaseForm] = useState({ ...EMPTY_PURCHASE });
  const [payoutForm, setPayoutForm] = useState({ ...EMPTY_PAYOUT });

  const updateO = (k: string, v: string) => setOrderForm(p => ({ ...p, [k]: v }));
  const updateP = (k: string, v: string) => setPurchaseForm(p => ({ ...p, [k]: v }));
  const updatePO = (k: string, v: string) => setPayoutForm(p => ({ ...p, [k]: v }));

  // Load all data from storage on mount
  useEffect(() => {
    try {
      const o = localStorage.getItem("vape_orders");
      const p = localStorage.getItem("vape_purchases");
      const po = localStorage.getItem("vape_payouts");
      if (o) setOrders(JSON.parse(o));
      if (p) setPurchases(JSON.parse(p));
      if (po) setPayouts(JSON.parse(po));
    } catch {}
    setLoading(false);
  }, []);

  const saveOrders = (data: Order[]) => { setOrders(data); try { localStorage.setItem("vape_orders", JSON.stringify(data)); } catch {} };
  const savePurchases = (data: Purchase[]) => { setPurchases(data); try { localStorage.setItem("vape_purchases", JSON.stringify(data)); } catch {} };
  const savePayouts = (data: Payout[]) => { setPayouts(data); try { localStorage.setItem("vape_payouts", JSON.stringify(data)); } catch {} };

  const addOrder = () => {
    if (editingId) { saveEdit(); return; }
    if (!orderForm.salePrice) { onToast("Enter sale price"); return; }
    const sale = parseInt(orderForm.salePrice);
    const purchase = parseInt(orderForm.purchasePrice || "0");
    const qty = parseInt(orderForm.qty || "1");
    const newOrder: Order = {
      id: String(orders.length + 1).padStart(3, "0"),
      date: orderForm.date, site: orderForm.site, product: orderForm.product,
      qty, salePrice: sale * qty, purchasePrice: purchase * qty, profit: (sale - purchase) * qty,
      status: orderForm.status, stockType: orderForm.stockType,
    };
    saveOrders([newOrder, ...orders]);
    setShowOrderForm(false); setOrderForm({ ...EMPTY_ORDER });
    onToast("Order logged");
  };

  const startEdit = (order: Order) => {
    setOrderForm({
      date: order.date, site: order.site, product: order.product,
      qty: String(order.qty),
      salePrice: String(Math.round(order.salePrice / order.qty)),
      purchasePrice: String(Math.round(order.purchasePrice / order.qty)),
      status: order.status, stockType: order.stockType || "own",
    });
    setEditingId(order.id);
    setShowOrderForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEdit = () => {
    if (!orderForm.salePrice) { onToast("Enter sale price"); return; }
    const sale = parseInt(orderForm.salePrice);
    const purchase = parseInt(orderForm.purchasePrice || "0");
    const qty = parseInt(orderForm.qty || "1");
    const updated = orders.map(o => o.id === editingId ? {
      ...o, date: orderForm.date, site: orderForm.site, product: orderForm.product,
      qty, salePrice: sale * qty, purchasePrice: purchase * qty, profit: (sale - purchase) * qty,
      status: orderForm.status, stockType: orderForm.stockType as "own" | "shop",
    } : o);
    saveOrders(updated);
    setShowOrderForm(false); setEditingId(null); setOrderForm({ ...EMPTY_ORDER });
    onToast("Order updated");
  };

  const addPurchase = () => {
    if (!purchaseForm.product || !purchaseForm.unitCost) { onToast("Fill product and cost"); return; }
    const qty = parseInt(purchaseForm.qty || "1");
    const unit = parseInt(purchaseForm.unitCost);
    const np: Purchase = {
      id: "P" + String(purchases.length + 1).padStart(3, "0"),
      date: purchaseForm.date, supplier: purchaseForm.supplier || "—",
      product: purchaseForm.product, qty, unitCost: unit, totalCost: qty * unit,
      site: purchaseForm.site, notes: purchaseForm.notes,
    };
    savePurchases([np, ...purchases]);
    setShowPurchaseForm(false); setPurchaseForm({ ...EMPTY_PURCHASE });
    onToast("Purchase logged");
  };

  const addPayout = () => {
    if (!payoutForm.recipient || !payoutForm.amount) { onToast("Fill recipient and amount"); return; }
    const np: Payout = {
      id: "O" + String(payouts.length + 1).padStart(3, "0"),
      date: payoutForm.date, recipient: payoutForm.recipient,
      amount: parseInt(payoutForm.amount), type: payoutForm.type, notes: payoutForm.notes,
    };
    savePayouts([np, ...payouts]);
    setShowPayoutForm(false); setPayoutForm({ ...EMPTY_PAYOUT });
    onToast("Payout logged");
  };

  const deleteOrder = (id: string) => { saveOrders(orders.filter(o => o.id !== id)); onToast("Deleted"); };
  const deletePurchase = (id: string) => { savePurchases(purchases.filter(p => p.id !== id)); onToast("Deleted"); };
  const deletePayout = (id: string) => { savePayouts(payouts.filter(p => p.id !== id)); onToast("Deleted"); };

  const resetAll = () => {
    await Promise.all([saveOrders([]), savePurchases([]), savePayouts([])]);
    setShowReset(false); onToast("All data cleared");
  };

  const downloadCSV = (filename: string, headers: string[], rows: (string|number)[][]) => {
    const today = new Date().toISOString().split("T")[0];
    const totalSaleAmt = orders.reduce((s,o) => s+o.salePrice, 0);
    const totalPurchaseAmt = orders.reduce((s,o) => s+o.purchasePrice, 0);
    const totalProfitAmt = orders.reduce((s,o) => s+o.profit, 0);
    const ownOrders = orders.filter(o => o.stockType === "own");
    const shopOrders = orders.filter(o => o.stockType === "shop");
    const totalPayoutsAmt = payouts.reduce((s,p) => s+p.amount, 0);
    const netProfit = totalProfitAmt - totalPayoutsAmt;
    const productBreakdown: Record<string, {qty:number,revenue:number,profit:number}> = {};
    orders.forEach(o => {
      if (!productBreakdown[o.product]) productBreakdown[o.product] = {qty:0,revenue:0,profit:0};
      productBreakdown[o.product].qty += o.qty;
      productBreakdown[o.product].revenue += o.salePrice;
      productBreakdown[o.product].profit += o.profit;
    });
    const topProducts = Object.entries(productBreakdown).sort((a,b)=>b[1].revenue-a[1].revenue).slice(0,5);
    const csv = [
      ["VAPE NETWORK — DETAILED REPORT"],
      ["Generated: " + today],
      [""],
      ["=== OVERALL SUMMARY ==="],
      ["Total Orders," + orders.length],
      ["Total Sales Revenue,Rs." + totalSaleAmt.toLocaleString("en-IN")],
      ["Total Purchase Cost,Rs." + totalPurchaseAmt.toLocaleString("en-IN")],
      ["Gross Profit,Rs." + totalProfitAmt.toLocaleString("en-IN")],
      ["Total Payouts,Rs." + totalPayoutsAmt.toLocaleString("en-IN")],
      ["Net Profit,Rs." + netProfit.toLocaleString("en-IN")],
      ["Profit Margin," + (totalSaleAmt > 0 ? Math.round((totalProfitAmt/totalSaleAmt)*100) : 0) + "%"],
      [""],
      ["=== STOCK TYPE BREAKDOWN ==="],
      ["Own Stock,Orders " + ownOrders.length + ",Profit Rs." + ownOrders.reduce((s,o)=>s+o.profit,0).toLocaleString("en-IN")],
      ["Shop Stock,Orders " + shopOrders.length + ",Profit Rs." + shopOrders.reduce((s,o)=>s+o.profit,0).toLocaleString("en-IN")],
      [""],
      ["=== CITY BREAKDOWN ==="],
      ...["VIM","TVH","TVP","VDB"].map(site => {
        const city = site==="VIM"?"Mumbai":site==="TVH"?"Hyderabad":site==="TVP"?"Pune":"Bangalore";
        const so = orders.filter(o=>o.site===site);
        return [city + ",Orders " + so.length + ",Sales Rs." + so.reduce((s,o)=>s+o.salePrice,0).toLocaleString("en-IN") + ",Profit Rs." + so.reduce((s,o)=>s+o.profit,0).toLocaleString("en-IN")];
      }),
      [""],
      ["=== TOP 5 PRODUCTS ==="],
      ...topProducts.map(([name,data]) => [name + ",Qty " + data.qty + ",Revenue Rs." + data.revenue.toLocaleString("en-IN") + ",Profit Rs." + data.profit.toLocaleString("en-IN")]),
      [""],
      ["=== EXPENSES ==="],
      ...["Delivery Cost","Hosting","Salary","Marketing","Other"].map(t => [t + ",Rs." + payouts.filter(p=>p.type===t).reduce((s,p)=>s+p.amount,0).toLocaleString("en-IN")]),
      [""],
      ["=== ORDER DETAILS ==="],
      headers, ...rows,
      [""],
      ["TOTALS,,,," + "Qty " + rows.reduce((s,r)=>s+(Number(r[4])||0),0) + ",Sale Rs." + totalSaleAmt.toLocaleString("en-IN") + ",Purchase Rs." + totalPurchaseAmt.toLocaleString("en-IN") + ",Profit Rs." + totalProfitAmt.toLocaleString("en-IN")],
    ].map(r => Array.isArray(r) ? r.join(",") : r).join("\\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "vape_report_" + today + ".csv";
    a.click(); onToast("Full report downloaded");
  };

  const downloadPurchases = () => {
    const today = new Date().toISOString().split("T")[0];
    const totalCost = purchases.reduce((s,p)=>s+p.totalCost,0);
    const csv = [
      ["STOCK PURCHASES REPORT — " + today],
      ["Total Entries," + purchases.length],
      ["Total Amount,Rs." + totalCost.toLocaleString("en-IN")],
      [""],
      ["#,Date,Supplier,Product,Qty,Unit Cost,Total,Site,Notes"],
      ...purchases.map(p => [p.id,p.date,p.supplier,p.product,p.qty,p.unitCost,"Rs."+p.totalCost.toLocaleString("en-IN"),p.site==="VIM"?"Mumbai":p.site==="TVH"?"Hyderabad":p.site==="TVP"?"Pune":"Bangalore",p.notes]),
      ["","","","TOTAL",purchases.reduce((s,p)=>s+p.qty,0),"","Rs."+totalCost.toLocaleString("en-IN"),"",""],
    ].map(r => Array.isArray(r) ? r.join(",") : r).join("\\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "purchases_" + today + ".csv"; a.click();
    onToast("Purchases exported");
  };

  const downloadPayouts = () => {
    const today = new Date().toISOString().split("T")[0];
    const totalAmt = payouts.reduce((s,p)=>s+p.amount,0);
    const byType: Record<string,number> = {};
    payouts.forEach(p => { byType[p.type] = (byType[p.type]||0) + p.amount; });
    const csv = [
      ["PAYOUTS REPORT — " + today],
      ["Total," + payouts.length + " entries,Rs." + totalAmt.toLocaleString("en-IN")],
      [""],
      ["=== BY CATEGORY ==="],
      ...Object.entries(byType).map(([t,a]) => [t + ",Rs." + a.toLocaleString("en-IN")]),
      [""],
      ["#,Date,Recipient,Type,Amount,Notes"],
      ...payouts.map(p => [p.id,p.date,p.recipient,p.type,"Rs."+p.amount.toLocaleString("en-IN"),p.notes]),
      ["TOTAL","","","","Rs."+totalAmt.toLocaleString("en-IN"),""],
    ].map(r => Array.isArray(r) ? r.join(",") : r).join("\\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "payouts_" + today + ".csv"; a.click();
    onToast("Payouts exported");
  };

  const filtered = filterSite === "all" ? orders : orders.filter(o => o.site === filterSite);
  const totalSale = filtered.reduce((s, o) => s + o.salePrice, 0);
  const totalProfit = filtered.reduce((s, o) => s + o.profit, 0);
  const totalPurchasesAmt = purchases.reduce((s, p) => s + p.totalCost, 0);
  const totalPayoutsAmt = payouts.reduce((s, p) => s + p.amount, 0);
  const margin = totalSale > 0 ? Math.round((totalProfit / totalSale) * 100) : 0;
  const siteRev: Record<string, number> = { VIM: 0, TVH: 0, TVP: 0, VDB: 0 };
  const sitePro: Record<string, number> = { VIM: 0, TVH: 0, TVP: 0, VDB: 0 };
  orders.forEach(o => { siteRev[o.site] = (siteRev[o.site] || 0) + o.salePrice; sitePro[o.site] = (sitePro[o.site] || 0) + o.profit; });
  const totalAll = Object.values(siteRev).reduce((a, b) => a + b, 0);

  const badge = (text: string, bg: string, color: string) => (
    <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{text}</span>
  );
  const delBtn = (onClick: () => void) => (
    <button onClick={onClick} style={{ background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 8px", color: "#E23744", cursor: "pointer", fontSize: 12 }}>X</button>
  );
  const label = (text: string) => <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{text}</label>;

  if (loading) return (
    <div style={{ padding: "3rem", textAlign: "center" as const, color: "#888" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>Loading...</div>
      <p style={{ fontSize: 13 }}>Syncing data across devices</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Accounts & Sales</h2>
          <p style={{ fontSize: 13, color: "#888" }}>Data synced across all devices</p>
        </div>
        <button onClick={() => setShowReset(true)} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13 }}>Reset All</button>
      </div>

      {showReset && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#E23744" }}>Reset all data?</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Clears all orders, purchases and payouts across all devices.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetAll} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontWeight: 700, fontSize: 12 }}>Yes, reset</button>
            <button onClick={() => setShowReset(false)} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 6, padding: "5px 14px", fontSize: 12 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Total revenue", value: "Rs." + totalAll.toLocaleString("en-IN"), sub: orders.length + " orders", color: "#0D0D0D" },
          { label: "Gross profit", value: "Rs." + totalProfit.toLocaleString("en-IN"), sub: margin + "% margin", color: "#059669" },
          { label: "Total outflow", value: "Rs." + (totalPurchasesAmt + totalPayoutsAmt).toLocaleString("en-IN"), sub: "Stock + expenses", color: "#E23744" },
          { label: "Mumbai", value: "Rs." + siteRev.VIM.toLocaleString("en-IN"), sub: "Profit Rs." + sitePro.VIM.toLocaleString("en-IN"), color: "#0D0D0D" },
          { label: "Hyderabad", value: "Rs." + siteRev.TVH.toLocaleString("en-IN"), sub: "Profit Rs." + sitePro.TVH.toLocaleString("en-IN"), color: "#0D0D0D" },
          { label: "Pune", value: "Rs." + siteRev.TVP.toLocaleString("en-IN"), sub: "Profit Rs." + sitePro.TVP.toLocaleString("en-IN"), color: "#0D0D0D" },
          { label: "Bangalore", value: "Rs." + siteRev.VDB.toLocaleString("en-IN"), sub: "Profit Rs." + sitePro.VDB.toLocaleString("en-IN"), color: "#0D0D0D" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "12px" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", overflowX: "auto" as const }}>
        {([["orders","Orders"],["purchases","Purchases"],["payouts","Payouts"]] as [string,string][]).map(([id, lbl]) => (
          <button key={id} onClick={() => setSubTab(id as "orders"|"purchases"|"payouts")} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + (subTab === id ? "#E23744" : "#e0e0e0"), background: subTab === id ? "#FEF2F2" : "#fff", color: subTab === id ? "#E23744" : "#555", fontWeight: subTab === id ? 700 : 400, fontSize: 13, whiteSpace: "nowrap" as const, cursor: "pointer" }}>{lbl}</button>
        ))}
      </div>

      {/* ORDERS */}
      {subTab === "orders" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap" as const, gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {["all","VIM","TVH","TVP","VDB"].map(s => (
                <button key={s} onClick={() => setFilterSite(s)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid " + (filterSite === s ? "#E23744" : "#e0e0e0"), background: filterSite === s ? "#FEF2F2" : "#fff", color: filterSite === s ? "#E23744" : "#555", fontSize: 12, fontWeight: filterSite === s ? 700 : 400, cursor: "pointer" }}>
                  {s === "all" ? "All" : s === "VIM" ? "Mumbai" : s === "TVH" ? "Hyderabad" : s === "TVP" ? "Pune" : "Bangalore"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => downloadCSV("orders", ["#","Date","Site","Product","Qty","Sale","Purchase","Profit","Stock","Status"], filtered.map(o => [o.id,o.date,o.site==="VIM"?"Mumbai":o.site==="TVH"?"Hyderabad":o.site==="TVP"?"Pune":"Bangalore",o.product,o.qty,o.salePrice,o.purchasePrice,o.profit,o.stockType==="own"?"Own Stock":"Shop Stock",o.status]))} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Export</button>
              <button onClick={() => { setShowOrderForm(!showOrderForm); setEditingId(null); setOrderForm({...EMPTY_ORDER}); }} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{editingId ? "Edit Order" : "+ Log Order"}</button>
            </div>
          </div>

          {showOrderForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>{editingId ? "Edit order" : "Log new order"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Date")}<input type="date" value={orderForm.date} onChange={e => updateO("date", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Site")}<select value={orderForm.site} onChange={e => updateO("site", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }}><option value="VIM">Mumbai</option><option value="TVH">Hyderabad</option><option value="TVP">Pune</option><option value="VDB">Bangalore</option></select></div>
                <div>{label("Product")}<select value={orderForm.product} onChange={e => updateO("product", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }}>{PRODUCTS.map(p => <option key={p}>{p}</option>)}</select></div>
                <div>{label("Qty")}<input type="number" value={orderForm.qty} onChange={e => updateO("qty", e.target.value)} min="1" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Sale price/unit (Rs.)")}<input type="number" value={orderForm.salePrice} onChange={e => updateO("salePrice", e.target.value)} placeholder="2399" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Purchase price/unit (Rs.)")}<input type="number" value={orderForm.purchasePrice} onChange={e => updateO("purchasePrice", e.target.value)} placeholder="1800" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Profit preview")}<div style={{ padding: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#059669" }}>Rs.{orderForm.salePrice && orderForm.purchasePrice ? ((parseInt(orderForm.salePrice) - parseInt(orderForm.purchasePrice)) * parseInt(orderForm.qty || "1")).toLocaleString("en-IN") : "—"}</div></div>
                <div>{label("Status")}<select value={orderForm.status} onChange={e => updateO("status", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }}><option>Delivered</option><option>Pending</option><option>Cancelled</option></select></div>
              </div>
              <div style={{ marginBottom: 12 }}>
                {label("Stock type")}
                <div style={{ display: "flex", gap: 10 }}>
                  {([["own","Own Stock","Bought in advance","#059669"],["shop","Shop Stock","Bought same day","#D97706"]] as [string,string,string,string][]).map(([val, lbl2, desc, color]) => (
                    <div key={val} onClick={() => updateO("stockType", val)} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "2px solid " + (orderForm.stockType === val ? color : "#e0e0e0"), background: orderForm.stockType === val ? color + "11" : "#fff", cursor: "pointer" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: orderForm.stockType === val ? color : "#555" }}>{lbl2}</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addOrder} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{editingId ? "Update" : "Save"}</button>
                <button onClick={() => { setShowOrderForm(false); setEditingId(null); setOrderForm({ ...EMPTY_ORDER }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {filtered.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center" as const, padding: "2rem" }}>No orders yet</p> : (
              <div style={{ overflowX: "auto" as const }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: "1px solid #e0e0e0" }}>{["#","Date","City","Product","Qty","Sale","Purchase","Profit","Stock","Status",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12, whiteSpace: "nowrap" as const }}>{h}</th>)}</tr></thead>
                  <tbody>{filtered.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 10px", color: "#aaa" }}>{o.id}</td>
                      <td style={{ padding: "8px 10px", whiteSpace: "nowrap" as const }}>{o.date}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(o.site==="VIM"?"Mumbai":o.site==="TVH"?"Hyderabad":o.site==="TVP"?"Pune":"Bangalore", "#FEF2F2", "#E23744")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 500, whiteSpace: "nowrap" as const }}>{o.product}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" as const }}>{o.qty}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, whiteSpace: "nowrap" as const }}>Rs.{o.salePrice.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", color: "#888", whiteSpace: "nowrap" as const }}>Rs.{o.purchasePrice.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#059669", whiteSpace: "nowrap" as const }}>Rs.{o.profit.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(o.stockType==="own"?"Own":"Shop", o.stockType==="own"?"#e8faf0":"#FFF9E6", o.stockType==="own"?"#059669":"#D97706")}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(o.status, o.status==="Delivered"?"#e8faf0":o.status==="Pending"?"#FFF9E6":"#FEF2F2", o.status==="Delivered"?"#059669":o.status==="Pending"?"#D97706":"#E23744")}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => startEdit(o)} style={{ background: "#EFF6FF", border: "none", borderRadius: 6, padding: "4px 8px", color: "#2563EB", cursor: "pointer", fontSize: 12 }}>Edit</button>
                          {delBtn(() => deleteOrder(o.id))}
                        </div>
                      </td>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" as const, gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Stock purchases ({purchases.length}) — Rs.{purchases.reduce((s,p)=>s+p.totalCost,0).toLocaleString("en-IN")}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadPurchases} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Export</button>
              <button onClick={() => { setPurchases([]); localStorage.setItem("vape_purchases", "[]"); onToast("Cleared"); }} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Reset</button>
              <button onClick={() => setShowPurchaseForm(!showPurchaseForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
            </div>
          </div>
          {showPurchaseForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Date")}<input type="date" value={purchaseForm.date} onChange={e => updateP("date", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Supplier")}<input value={purchaseForm.supplier} onChange={e => updateP("supplier", e.target.value)} placeholder="Elfbar Distributor" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Site")}<select value={purchaseForm.site} onChange={e => updateP("site", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }}><option value="VIM">Mumbai</option><option value="TVH">Hyderabad</option><option value="TVP">Pune</option><option value="VDB">Bangalore</option><option value="All">All Cities</option></select></div>
                <div>{label("Product")}<input value={purchaseForm.product} onChange={e => updateP("product", e.target.value)} placeholder="Elfbar Raya D1" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Qty")}<input type="number" value={purchaseForm.qty} onChange={e => updateP("qty", e.target.value)} min="1" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Unit cost (Rs.)")}<input type="number" value={purchaseForm.unitCost} onChange={e => updateP("unitCost", e.target.value)} placeholder="1800" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Total")}<div style={{ padding: "8px", background: "#FEF2F2", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#E23744" }}>Rs.{purchaseForm.unitCost && purchaseForm.qty ? (parseInt(purchaseForm.unitCost)*parseInt(purchaseForm.qty||"1")).toLocaleString("en-IN") : "—"}</div></div>
              </div>
              <div style={{ marginBottom: 12 }}>{label("Notes")}<input value={purchaseForm.notes} onChange={e => updateP("notes", e.target.value)} placeholder="Optional" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addPurchase} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
                <button onClick={() => { setShowPurchaseForm(false); setPurchaseForm({ ...EMPTY_PURCHASE }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {purchases.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center" as const, padding: "2rem" }}>No purchases yet</p> : (
              <div style={{ overflowX: "auto" as const }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: "1px solid #e0e0e0" }}>{["#","Date","Supplier","Product","Qty","Unit","Total","City","Notes",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12, whiteSpace: "nowrap" as const }}>{h}</th>)}</tr></thead>
                  <tbody>{purchases.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 10px", color: "#aaa" }}>{p.id}</td>
                      <td style={{ padding: "8px 10px" }}>{p.date}</td>
                      <td style={{ padding: "8px 10px" }}>{p.supplier}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 500 }}>{p.product}</td>
                      <td style={{ padding: "8px 10px", textAlign: "center" as const }}>{p.qty}</td>
                      <td style={{ padding: "8px 10px" }}>Rs.{p.unitCost.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#E23744" }}>Rs.{p.totalCost.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(p.site==="VIM"?"Mumbai":p.site==="TVH"?"Hyderabad":p.site==="TVP"?"Pune":p.site==="VDB"?"Bangalore":"All", "#FEF2F2", "#E23744")}</td>
                      <td style={{ padding: "8px 10px", color: "#888" }}>{p.notes||"—"}</td>
                      <td style={{ padding: "8px 10px" }}>{delBtn(() => deletePurchase(p.id))}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYOUTS */}
      {subTab === "payouts" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" as const, gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Payouts ({payouts.length}) — Rs.{payouts.reduce((s,p)=>s+p.amount,0).toLocaleString("en-IN")}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadPayouts} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Export</button>
              <button onClick={() => { setPayouts([]); localStorage.setItem("vape_payouts", "[]"); onToast("Cleared"); }} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Reset</button>
              <button onClick={() => setShowPayoutForm(!showPayoutForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
            </div>
          </div>
          {showPayoutForm && (
            <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 12 }}>
                <div>{label("Date")}<input type="date" value={payoutForm.date} onChange={e => updatePO("date", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Recipient")}<input value={payoutForm.recipient} onChange={e => updatePO("recipient", e.target.value)} placeholder="Delivery Partner" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
                <div>{label("Type")}<select value={payoutForm.type} onChange={e => updatePO("type", e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }}>{PAYOUT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div>{label("Amount (Rs.)")}<input type="number" value={payoutForm.amount} onChange={e => updatePO("amount", e.target.value)} placeholder="1500" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}>{label("Notes")}<input value={payoutForm.notes} onChange={e => updatePO("notes", e.target.value)} placeholder="Optional" style={{ width: "100%", padding: "8px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13 }} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addPayout} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
                <button onClick={() => { setShowPayoutForm(false); setPayoutForm({ ...EMPTY_PAYOUT }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
            {payouts.length === 0 ? <p style={{ fontSize: 13, color: "#888", textAlign: "center" as const, padding: "2rem" }}>No payouts yet</p> : (
              <div style={{ overflowX: "auto" as const }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: "1px solid #e0e0e0" }}>{["#","Date","Recipient","Type","Amount","Notes",""].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12 }}>{h}</th>)}</tr></thead>
                  <tbody>{payouts.map(p => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 10px", color: "#aaa" }}>{p.id}</td>
                      <td style={{ padding: "8px 10px" }}>{p.date}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 500 }}>{p.recipient}</td>
                      <td style={{ padding: "8px 10px" }}>{badge(p.type, "#FFF9E6", "#D97706")}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#D97706" }}>Rs.{p.amount.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", color: "#888" }}>{p.notes||"—"}</td>
                      <td style={{ padding: "8px 10px" }}>{delBtn(() => deletePayout(p.id))}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
