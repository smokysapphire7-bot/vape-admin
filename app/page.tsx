"use client";
import { useState } from "react";
import PriceEditor from "./components/PriceEditor";
import BannerEditor from "./components/BannerEditor";
import ProductAdder from "./components/ProductAdder";
import DeployPanel from "./components/DeployPanel";
import Accounts from "./components/Accounts";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "vapeadmin2026";

const HOOKS = {
  vim: process.env.NEXT_PUBLIC_HOOK_VIM || "",
  tvh: process.env.NEXT_PUBLIC_HOOK_TVH || "",
  tvp: process.env.NEXT_PUBLIC_HOOK_TVP || "",
};

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");
  const [toast, setToast] = useState("");
  const [deployLog, setDeployLog] = useState<string[]>([]);

  const login = () => {
    if (password === ADMIN_PASSWORD) { setLoggedIn(true); setError(false); }
    else setError(true);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const triggerDeploy = async (site: "vim" | "tvh" | "tvp") => {
    try {
      await fetch(HOOKS[site], { method: "POST", mode: "no-cors" });
      const now = new Date().toLocaleTimeString();
      setDeployLog(prev => [`[${now}] ${site.toUpperCase()} deploy triggered`, ...prev].slice(0, 15));
      return true;
    } catch { return false; }
  };

  const deployAll = async () => {
    showToast("Deploying all 3 sites — ready in ~60s");
    await Promise.all([triggerDeploy("vim"), triggerDeploy("tvh"), triggerDeploy("tvp")]);
  };

  const deploySingle = async (site: "vim" | "tvh" | "tvp") => {
    await triggerDeploy(site);
    showToast(`${site.toUpperCase()} deploy triggered — ready in ~60s`);
  };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0e0e0", padding: "2rem", width: 340 }}>
          <div style={{ width: 48, height: 48, background: "#E23744", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#fff", fontSize: 24 }}>🔐</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Vape Network Admin</h1>
          <p style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem" }}>Enter password to continue</p>
          <input type="password" placeholder="Admin password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ marginBottom: 8 }}
          />
          {error && <p style={{ color: "#E23744", fontSize: 12, marginBottom: 8 }}>Incorrect password</p>}
          <button onClick={login} style={{ width: "100%", background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 14 }}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "prices", label: "💰 Prices" },
    { id: "accounts", label: "📊 Accounts" },
    { id: "banner", label: "📢 Banner" },
    { id: "product", label: "➕ Add Product" },
    { id: "deploy", label: "🚀 Deploy" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#fff", borderRight: "1px solid #e0e0e0", padding: "1.5rem 0", position: "fixed", height: "100vh", top: 0, left: 0 }}>
        <div style={{ padding: "0 1rem 1.5rem", borderBottom: "1px solid #f0f0f0", marginBottom: "1rem" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0D0D0D" }}>VAPE <span style={{ color: "#E23744" }}>ADMIN</span></div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Network Control Panel</div>
        </div>
        {tabs.map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "10px 1rem", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 400, color: activeTab === tab.id ? "#E23744" : "#555", cursor: "pointer", background: activeTab === tab.id ? "#FEF2F2" : "transparent", borderLeft: activeTab === tab.id ? "3px solid #E23744" : "3px solid transparent" }}>
            {tab.label}
          </div>
        ))}
        <div style={{ position: "absolute", bottom: "1rem", left: 0, right: 0, padding: "0 1rem" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["VIM", "TVH", "TVP"].map(s => (
              <span key={s} style={{ fontSize: 11, background: "#e8faf0", color: "#059669", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>● {s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, padding: "2rem" }}>
        {activeTab === "prices" && <PriceEditor onDeploy={deployAll} onToast={showToast} />}
        {activeTab === "banner" && <BannerEditor onDeploy={deployAll} onToast={showToast} />}
        {activeTab === "product" && <ProductAdder onDeploy={deployAll} onToast={showToast} />}
        {activeTab === "deploy" && <DeployPanel onDeployAll={deployAll} onDeploySingle={deploySingle} deployLog={deployLog} />}
        {activeTab === "accounts" && <Accounts onToast={showToast} />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", background: "#0D0D0D", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 999 }}>
          ✅ {toast}
        </div>
      )}
    </div>
  );
}
