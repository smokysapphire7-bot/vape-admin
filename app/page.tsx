"use client";
import { useState } from "react";
import PriceEditor from "./components/PriceEditor";
import BannerEditor from "./components/BannerEditor";
import ProductAdder from "./components/ProductAdder";
import DeployPanel from "./components/DeployPanel";
import Accounts from "./components/Accounts";

const HOOKS = {
  vim: process.env.NEXT_PUBLIC_HOOK_VIM || "",
  tvh: process.env.NEXT_PUBLIC_HOOK_TVH || "",
  tvp: process.env.NEXT_PUBLIC_HOOK_TVP || "",
  vdb: process.env.NEXT_PUBLIC_HOOK_VDB || "",
};

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(() => {
    try { return localStorage.getItem("vape_admin_auth") === "true"; } catch { return false; }
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("prices");
  const [toast, setToast] = useState("");
  const [deployLog, setDeployLog] = useState<string[]>([]);

  const login = async () => {
    try {
      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (data.ok) {
        setLoggedIn(true); setError(false);
        try { localStorage.setItem("vape_admin_auth", "true"); } catch {}
      } else setError(true);
    } catch { setError(true); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const triggerDeploy = async (site: "vim" | "tvh" | "tvp" | "vdb") => {
    try {
      await fetch(HOOKS[site], { method: "POST", mode: "no-cors" });
      const now = new Date().toLocaleTimeString();
      setDeployLog(prev => [`[${now}] ${site.toUpperCase()} deploy triggered`, ...prev].slice(0, 15));
      return true;
    } catch { return false; }
  };

  const deployAll = async () => {
    showToast("Deploying all sites — ready in ~60s");
    await Promise.all([triggerDeploy("vim"), triggerDeploy("tvh"), triggerDeploy("tvp"), triggerDeploy("vdb")]);
  };

  const deploySingle = async (site: "vim" | "tvh" | "tvp" | "vdb") => {
    await triggerDeploy(site);
    showToast(`${site.toUpperCase()} deploy triggered — ready in ~60s`);
  };

  const tabs = [
    { id: "prices", label: "Prices" },
    { id: "accounts", label: "Accounts" },
    { id: "banner", label: "Banner" },
    { id: "product", label: "Add Product" },
    { id: "deploy", label: "Deploy" },
  ];

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e0e0e0", padding: "2rem", width: "100%", maxWidth: 360 }}>
          <div style={{ width: 48, height: 48, background: "#E23744", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <span style={{ color: "#fff", fontSize: 24 }}>&#128272;</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Vape Network Admin</h1>
          <p style={{ fontSize: 13, color: "#888", marginBottom: "1.5rem" }}>Enter password to continue</p>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ marginBottom: 8, width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
          />
          {error && <p style={{ color: "#E23744", fontSize: 12, marginBottom: 8 }}>Incorrect password</p>}
          <button onClick={login} style={{ width: "100%", background: "#E23744", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0D0D0D" }}>
          VAPE <span style={{ color: "#E23744" }}>ADMIN</span>
          <span style={{ fontSize: 10, fontWeight: 400, color: "#aaa", marginLeft: 8 }}>Network Control</span>
        </div>
        <button
          onClick={() => { setLoggedIn(false); try { localStorage.removeItem("vape_admin_auth"); } catch {} }}
          style={{ fontSize: 12, color: "#888", background: "none", border: "1px solid #e0e0e0", borderRadius: 6, cursor: "pointer", padding: "5px 12px" }}
        >
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", display: "flex", overflowX: "auto" as const, WebkitOverflowScrolling: "touch" as const }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "#E23744" : "#666",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #E23744" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px", maxWidth: 960, margin: "0 auto", width: "100%", boxSizing: "border-box" as const }}>
        {activeTab === "prices" && <PriceEditor onDeploy={deployAll} onToast={showToast} />}
        {activeTab === "accounts" && <Accounts onToast={showToast} />}
        {activeTab === "banner" && <BannerEditor onDeploy={deployAll} onToast={showToast} />}
        {activeTab === "product" && <ProductAdder onDeploy={deployAll} onToast={showToast} />}
        {activeTab === "deploy" && <DeployPanel onDeployAll={deployAll} onDeploySingle={deploySingle} deployLog={deployLog} />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", background: "#0D0D0D", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 999, whiteSpace: "nowrap" as const }}>
          {toast}
        </div>
      )}

    </div>
  );
}
