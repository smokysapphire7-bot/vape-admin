"use client";
import { useState } from "react";

type Order = {
  id: string;
  date: string;
  site: string;
  product: string;
  customerName: string;
  qty: number;
  salePrice: number;
  purchasePrice: number;
  profit: number;
  area: string;
  status: string;
};

const SAMPLE_ORDERS: Order[] = [
  { id: "001", date: "2026-07-06", site: "VIM", product: "Elfbar Raya D1", customerName: "Rahul S.", qty: 1, salePrice: 2399, purchasePrice: 1800, profit: 599, area: "Bandra West", status: "Delivered" },
  { id: "002", date: "2026-07-06", site: "TVH", product: "ZYN Cool Mint", customerName: "Priya K.", qty: 2, salePrice: 2598, purchasePrice: 1800, profit: 798, area: "HITEC City", status: "Delivered" },
  { id: "003", date: "2026-07-06", site: "TVP", product: "Caliburn G4", customerName: "Arjun M.", qty: 1, salePrice: 7499, purchasePrice: 5500, profit: 1999, area: "Koregaon Park", status: "Delivered" },
  { id: "004", date: "2026-07-05", site: "VIM", product: "Elfbar MoonNight 40K", customerName: "Sneha R.", qty: 1, salePrice: 3299, purchasePrice: 2400, profit: 899, area: "Andheri West", status: "Delivered" },
  { id: "005", date: "2026-07-05", site: "TVH", product: "Elfbar Raya D3", customerName: "Karan D.", qty: 2, salePrice: 5998, purchasePrice: 4400, profit: 1598, area: "Banjara Hills", status: "Delivered" },
];

const PRODUCTS = [
  "Elfbar 600","Elfbar Raya D1","Elfbar MoonNight 40K","Elfbar Raya D3",
  "Elfbar D3 Pro","Elfbar Ice King","Elfbar SOBO","Elfbar Trio","Elfbar BC10000",
  "Lost Mary MT35000","Lost Mary MO10000","Nasty Bolt WTF 50K","IGET Astro B18K",
  "Yuoto Beyonder","Yuoto Thanos","Elfliq Nic Salt","Pod Salt Core","Nasty Salt",
  "ZYN Cool Mint","Velo Peppermint","Tobacco","Caliburn G3 Pro","Caliburn G4",
  "Caliburn G4 Pro","Caliburn G5 Lite","Caliburn GK2",
];

const EMPTY_FORM = { site: "VIM", product: "Elfbar Raya D1", customerName: "", qty: "1", salePrice: "", purchasePrice: "", area: "", status: "Delivered", date: new Date().toISOString().split("T")[0] };

type Props = { onToast: (msg: string) => void; };

export default function Accounts({ onToast }: Props) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("vape_orders");
      return saved ? JSON.parse(saved) : SAMPLE_ORDERS;
    } catch { return SAMPLE_ORDERS; }
  });
  const [filterSite, setFilterSite] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const deleteOrder = (id: string) => {
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== id);
      try { localStorage.setItem("vape_orders", JSON.stringify(updated)); } catch {}
      return updated;
    });
    onToast("Order deleted");
  };

  const downloadExcel = () => {
    const headers = ["#","Date","Site","Customer","Product","Qty","Sale Price","Purchase Price","Profit","Area","Status"];
    const rows = filtered.map(o => [o.id, o.date, o.site, o.customerName, o.product, o.qty, o.salePrice, o.purchasePrice, o.profit, o.area, o.status]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vape_orders_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click(); URL.revokeObjectURL(url);
    onToast("Orders exported");
  };

  const addOrder = () => {
    if (!form.salePrice || !form.area) { onToast("Please fill sale price and area"); return; }
    const sale = parseInt(form.salePrice);
    const purchase = parseInt(form.purchasePrice || "0");
    const qty = parseInt(form.qty || "1");
    const newOrder: Order = {
      id: String(orders.length + 1).padStart(3, "0"),
      date: form.date || new Date().toISOString().split("T")[0],
      site: form.site,
      product: form.product,
      customerName: form.customerName || "—",
      qty,
      salePrice: sale * qty,
      purchasePrice: purchase * qty,
      profit: (sale - purchase) * qty,
      area: form.area,
      status: form.status,
    };
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      try { localStorage.setItem("vape_orders", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    onToast("Order logged successfully");
  };

  const resetAll = () => {
    setOrders([]); try { localStorage.setItem("vape_orders", JSON.stringify([])); } catch {};
    setShowReset(false);
    onToast("All account data cleared");
  };

  const filtered = filterSite === "all" ? orders : orders.filter(o => o.site === filterSite);
  const totalSale = filtered.reduce((sum, o) => sum + o.salePrice, 0);
  const totalPurchase = filtered.reduce((sum, o) => sum + o.purchasePrice, 0);
  const totalProfit = filtered.reduce((sum, o) => sum + o.profit, 0);
  const totalOrders = filtered.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalSale / totalOrders) : 0;
  const margin = totalSale > 0 ? Math.round((totalProfit / totalSale) * 100) : 0;

  const siteRevenue = { VIM: 0, TVH: 0, TVP: 0 };
  const siteProfit = { VIM: 0, TVH: 0, TVP: 0 };
  orders.forEach(o => {
    siteRevenue[o.site as keyof typeof siteRevenue] += o.salePrice;
    siteProfit[o.site as keyof typeof siteProfit] += o.profit;
  });
  const totalAll = Object.values(siteRevenue).reduce((a, b) => a + b, 0);

  const productSales: Record<string, { revenue: number; profit: number; qty: number }> = {};
  filtered.forEach(o => {
    if (!productSales[o.product]) productSales[o.product] = { revenue: 0, profit: 0, qty: 0 };
    productSales[o.product].revenue += o.salePrice;
    productSales[o.product].profit += o.profit;
    productSales[o.product].qty += o.qty;
  });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Accounts & Sales</h2>
          <p style={{ fontSize: 13, color: "#888" }}>Track orders, revenue and profit across all sites</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={downloadExcel} style={{ background: "#fff", color: "#059669", border: "1px solid #059669", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13 }}>
            ⬇ Export Excel
          </button>
          <button onClick={() => setShowReset(true)} style={{ background: "#fff", color: "#E23744", border: "1px solid #E23744", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 13 }}>
            🗑 Reset Data
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13 }}>
            + Log Order
          </button>
        </div>
      </div>

      {/* Reset Confirm */}
      {showReset && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#E23744" }}>Reset all account data?</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>This will permanently clear all orders. Cannot be undone.</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={resetAll} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 700, fontSize: 13 }}>Yes, reset</button>
            <button onClick={() => setShowReset(false)} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 13, color: "#555" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Add Order Form */}
      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Log new order</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Date</label>
              <input type="date" value={form.date} onChange={e => update("date", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Site</label>
              <select value={form.site} onChange={e => update("site", e.target.value)}>
                <option>VIM</option><option>TVH</option><option>TVP</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Product</label>
              <select value={form.product} onChange={e => update("product", e.target.value)}>
                {PRODUCTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Customer name</label>
              <input value={form.customerName} onChange={e => update("customerName", e.target.value)} placeholder="e.g. Rahul S." />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Qty (default 1)</label>
              <input type="number" value={form.qty} onChange={e => update("qty", e.target.value)} min="1" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Sale price / unit (₹) *</label>
              <input type="number" value={form.salePrice} onChange={e => update("salePrice", e.target.value)} placeholder="2399" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Purchase price / unit (₹)</label>
              <input type="number" value={form.purchasePrice} onChange={e => update("purchasePrice", e.target.value)} placeholder="1800" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Profit preview</label>
              <div style={{ padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#059669" }}>
                ₹{form.salePrice && form.purchasePrice ? ((parseInt(form.salePrice) - parseInt(form.purchasePrice)) * parseInt(form.qty || "1")).toLocaleString("en-IN") : "—"}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Delivery area *</label>
              <input value={form.area} onChange={e => update("area", e.target.value)} placeholder="e.g. Bandra West" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Status</label>
              <select value={form.status} onChange={e => update("status", e.target.value)}>
                <option>Delivered</option><option>Pending</option><option>Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addOrder} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13 }}>Save order</button>
            <button onClick={() => { setShowForm(false); setForm({ ...EMPTY_FORM }); }} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 13, color: "#555" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1rem" }}>
        {[
          { label: "Total revenue", value: "₹" + totalAll.toLocaleString("en-IN"), sub: "All sites combined", color: "#0D0D0D" },
          { label: "Total profit", value: "₹" + totalProfit.toLocaleString("en-IN"), sub: margin + "% margin", color: "#059669" },
          { label: "Total orders", value: String(orders.length), sub: "All sites", color: "#0D0D0D" },
          { label: "VIM revenue", value: "₹" + siteRevenue.VIM.toLocaleString("en-IN"), sub: "Profit ₹" + siteProfit.VIM.toLocaleString("en-IN"), color: "#0D0D0D" },
          { label: "TVH revenue", value: "₹" + siteRevenue.TVH.toLocaleString("en-IN"), sub: "Profit ₹" + siteProfit.TVH.toLocaleString("en-IN"), color: "#0D0D0D" },
          { label: "TVP revenue", value: "₹" + siteRevenue.TVP.toLocaleString("en-IN"), sub: "Profit ₹" + siteProfit.TVP.toLocaleString("en-IN"), color: "#0D0D0D" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Top Products + Revenue by Site */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Top products</h3>
          {topProducts.length === 0 ? <p style={{ fontSize: 13, color: "#888" }}>No data yet</p> : topProducts.map(([name, data], i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < topProducts.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#E23744", width: 18 }}>#{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#0D0D0D" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>Qty: {data.qty}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>₹{data.revenue.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: 11, color: "#059669" }}>+₹{data.profit.toLocaleString("en-IN")}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Revenue by site</h3>
          {Object.entries(siteRevenue).map(([site, rev]) => (
            <div key={site} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{site}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, color: "#555" }}>₹{rev.toLocaleString("en-IN")}</span>
                  <span style={{ fontSize: 11, color: "#059669", marginLeft: 6 }}>+₹{siteProfit[site as keyof typeof siteProfit].toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6 }}>
                <div style={{ background: "#E23744", borderRadius: 4, height: 6, width: totalAll > 0 ? (rev / totalAll * 100) + "%" : "0%", transition: "width 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Order history ({filtered.length})</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "VIM", "TVH", "TVP"].map(s => (
              <button key={s} onClick={() => setFilterSite(s)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid " + (filterSite === s ? "#E23744" : "#e0e0e0"), background: filterSite === s ? "#FEF2F2" : "#fff", color: filterSite === s ? "#E23744" : "#555", fontSize: 12, fontWeight: filterSite === s ? 700 : 400 }}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888", textAlign: "center", padding: "2rem" }}>No orders yet. Click "+ Log Order" to add one.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                  {["#","Date","Site","Customer","Product","Qty","Sale","Purchase","Profit","Area","Status",""].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "8px 10px", color: "#aaa" }}>{order.id}</td>
                    <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{order.date}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: "#FEF2F2", color: "#E23744", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{order.site}</span>
                    </td>
                    <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>{order.customerName}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 500, whiteSpace: "nowrap" }}>{order.product}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>{order.qty}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>₹{order.salePrice.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", color: "#888", whiteSpace: "nowrap" }}>₹{order.purchasePrice.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#059669", whiteSpace: "nowrap" }}>₹{order.profit.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "8px 10px", color: "#555", whiteSpace: "nowrap" }}>{order.area}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: order.status === "Delivered" ? "#e8faf0" : order.status === "Pending" ? "#FFF9E6" : "#FEF2F2", color: order.status === "Delivered" ? "#059669" : order.status === "Pending" ? "#D97706" : "#E23744", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{order.status}</span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={() => deleteOrder(order.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 8px", color: "#E23744", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
