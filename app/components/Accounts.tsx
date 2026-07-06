"use client";
import { useState } from "react";

type Order = {
  id: string;
  date: string;
  site: string;
  product: string;
  qty: number;
  price: number;
  area: string;
  status: string;
};

const SAMPLE_ORDERS: Order[] = [
  { id: "001", date: "2026-07-06", site: "VIM", product: "Elfbar Raya D1", qty: 1, price: 2399, area: "Bandra West", status: "Delivered" },
  { id: "002", date: "2026-07-06", site: "TVH", product: "ZYN Cool Mint", qty: 2, price: 2598, area: "HITEC City", status: "Delivered" },
  { id: "003", date: "2026-07-06", site: "TVP", product: "Caliburn G4", qty: 1, price: 7499, area: "Koregaon Park", status: "Delivered" },
  { id: "004", date: "2026-07-05", site: "VIM", product: "Elfbar MoonNight 40K", qty: 1, price: 3299, area: "Andheri West", status: "Delivered" },
  { id: "005", date: "2026-07-05", site: "TVH", product: "Elfbar Raya D3", qty: 2, price: 5998, area: "Banjara Hills", status: "Delivered" },
  { id: "006", date: "2026-07-05", site: "TVP", product: "Nasty Bolt 50K", qty: 1, price: 3499, area: "Baner", status: "Delivered" },
  { id: "007", date: "2026-07-04", site: "VIM", product: "Caliburn G3 Pro", qty: 1, price: 7999, area: "Powai", status: "Delivered" },
  { id: "008", date: "2026-07-04", site: "TVH", product: "Elfliq Nic Salt", qty: 3, price: 5997, area: "Gachibowli", status: "Delivered" },
];

const PRODUCTS = [
  "Elfbar 600","Elfbar Raya D1","Elfbar MoonNight 40K","Elfbar Raya D3",
  "Elfbar D3 Pro","Elfbar Ice King","Elfbar SOBO","Elfbar Trio","Elfbar BC10000",
  "Lost Mary MT35000","Lost Mary MO10000","Nasty Bolt 50K","IGET Astro B18K",
  "Yuoto Beyonder","Yuoto Thanos","Elfliq Nic Salt","Pod Salt Core","Nasty Salt",
  "ZYN Cool Mint","Velo Peppermint","Tobacco","Caliburn G3 Pro","Caliburn G4",
  "Caliburn G4 Pro","Caliburn G5 Lite","Caliburn GK2",
];

type Props = { onToast: (msg: string) => void; };

export default function Accounts({ onToast }: Props) {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [filterSite, setFilterSite] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ site: "VIM", product: "Elfbar Raya D1", qty: "1", price: "", area: "", status: "Delivered" });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const addOrder = () => {
    if (!form.price || !form.area) { onToast("Please fill price and area"); return; }
    const newOrder: Order = {
      id: String(orders.length + 1).padStart(3, "0"),
      date: new Date().toISOString().split("T")[0],
      site: form.site,
      product: form.product,
      qty: parseInt(form.qty),
      price: parseInt(form.price),
      area: form.area,
      status: form.status,
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowForm(false);
    setForm({ site: "VIM", product: "Elfbar Raya D1", qty: "1", price: "", area: "", status: "Delivered" });
    onToast("Order added successfully");
  };

  const filtered = filterSite === "all" ? orders : orders.filter(o => o.site === filterSite);
  const totalRevenue = filtered.reduce((sum, o) => sum + o.price, 0);
  const totalOrders = filtered.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const productSales: Record<string, number> = {};
  filtered.forEach(o => { productSales[o.product] = (productSales[o.product] || 0) + o.price; });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const siteRevenue = { VIM: 0, TVH: 0, TVP: 0 };
  orders.forEach(o => { siteRevenue[o.site as keyof typeof siteRevenue] += o.price; });
  const totalAll = Object.values(siteRevenue).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Accounts & Sales</h2>
          <p style={{ fontSize: 13, color: "#888" }}>Track orders and revenue across all sites</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13 }}>
          + Log Order
        </button>
      </div>

      {/* Add Order Form */}
      {showForm && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Log new order</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
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
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Qty</label>
              <input type="number" value={form.qty} onChange={e => update("qty", e.target.value)} min="1" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Total price (₹) *</label>
              <input type="number" value={form.price} onChange={e => update("price", e.target.value)} placeholder="2399" />
            </div>
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
            <button onClick={() => setShowForm(false)} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 13, color: "#555" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Revenue Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1rem" }}>
        {[
          { label: "Total revenue", value: "₹" + totalAll.toLocaleString("en-IN"), sub: "All sites" },
          { label: "VIM revenue", value: "₹" + siteRevenue.VIM.toLocaleString("en-IN"), sub: "Mumbai" },
          { label: "TVH revenue", value: "₹" + siteRevenue.TVH.toLocaleString("en-IN"), sub: "Hyderabad" },
          { label: "TVP revenue", value: "₹" + siteRevenue.TVP.toLocaleString("en-IN"), sub: "Pune" },
          { label: "Total orders", value: String(orders.length), sub: "All sites" },
          { label: "Avg order value", value: "₹" + avgOrder.toLocaleString("en-IN"), sub: "Filtered view" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1rem" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0D0D0D" }}>{card.value}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Top products */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Top products by revenue</h3>
          {topProducts.map(([name, rev], i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < topProducts.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#E23744", width: 16 }}>#{i + 1}</span>
                <span style={{ fontSize: 13, color: "#0D0D0D" }}>{name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0D0D0D" }}>₹{rev.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Revenue by site</h3>
          {Object.entries(siteRevenue).map(([site, rev]) => (
            <div key={site} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{site}</span>
                <span style={{ fontSize: 13, color: "#555" }}>₹{rev.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6 }}>
                <div style={{ background: "#E23744", borderRadius: 4, height: 6, width: totalAll > 0 ? (rev / totalAll * 100) + "%" : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Order history</h3>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "VIM", "TVH", "TVP"].map(s => (
              <button key={s} onClick={() => setFilterSite(s)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid " + (filterSite === s ? "#E23744" : "#e0e0e0"), background: filterSite === s ? "#FEF2F2" : "#fff", color: filterSite === s ? "#E23744" : "#555", fontSize: 12, fontWeight: filterSite === s ? 700 : 400 }}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                {["#","Date","Site","Product","Qty","Amount","Area","Status"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#888", fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "8px 10px", color: "#888" }}>{order.id}</td>
                  <td style={{ padding: "8px 10px" }}>{order.date}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ background: "#FEF2F2", color: "#E23744", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{order.site}</span>
                  </td>
                  <td style={{ padding: "8px 10px", fontWeight: 500 }}>{order.product}</td>
                  <td style={{ padding: "8px 10px" }}>{order.qty}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>₹{order.price.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "8px 10px", color: "#555" }}>{order.area}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ background: order.status === "Delivered" ? "#e8faf0" : order.status === "Pending" ? "#FFF9E6" : "#FEF2F2", color: order.status === "Delivered" ? "#059669" : order.status === "Pending" ? "#D97706" : "#E23744", padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
