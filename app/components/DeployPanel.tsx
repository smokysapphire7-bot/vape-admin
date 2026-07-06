"use client";

type Props = {
  onDeployAll: () => void;
  onDeploySingle: (site: "vim" | "tvh" | "tvp") => void;
  deployLog: string[];
};

const SITES = [
  { key: "vim" as const, name: "vapeinmumbai.com", label: "VIM — Mumbai" },
  { key: "tvh" as const, name: "thevapesinhyderabad.com", label: "TVH — Hyderabad" },
  { key: "tvp" as const, name: "vapesinpune.com", label: "TVP — Pune" },
];

export default function DeployPanel({ onDeployAll, onDeploySingle, deployLog }: Props) {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Deploy</h2>
        <p style={{ fontSize: 13, color: "#888" }}>Trigger a rebuild on any site — ready in ~60 seconds</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
        {SITES.map((site, i) => (
          <div key={site.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < SITES.length - 1 ? "1px solid #f0f0f0" : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0D0D0D" }}>{site.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{site.label}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, background: "#e8faf0", color: "#059669", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>● Live</span>
              <button onClick={() => onDeploySingle(site.key)} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#555", display: "flex", alignItems: "center", gap: 4 }}>
                🚀 Deploy
              </button>
            </div>
          </div>
        ))}
        <button onClick={onDeployAll} style={{ width: "100%", background: "#E23744", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🚀 Deploy all 3 sites
        </button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Deploy log</h3>
        {deployLog.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888" }}>No deploys yet</p>
        ) : (
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#555", lineHeight: 1.8 }}>
            {deployLog.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
