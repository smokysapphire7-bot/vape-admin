"use client";
import { useState } from "react";

type Props = { onDeploy: () => void; onToast: (msg: string) => void; };

export default function BannerEditor({ onDeploy, onToast }: Props) {
  const [bannerOn, setBannerOn] = useState(true);
  const [text, setText] = useState("20% OFF this weekend — Elfbar Raya D1 at ₹1,999");
  const [subText, setSubText] = useState("Limited time offer. Order on WhatsApp now.");
  const [color, setColor] = useState("#E23744");
  const [imgPreview, setImgPreview] = useState("");

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImgPreview(URL.createObjectURL(file));
  };

  const handleDeploy = async () => {
    onToast("Banner saved — deploying all sites...");
    await onDeploy();
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Offer banner</h2>
        <p style={{ fontSize: 13, color: "#888" }}>Show a promotional banner on all homepages</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: "1rem" }}>Preview</h3>
        <div style={{ background: color, backgroundImage: imgPreview ? "url(" + imgPreview + ")" : "none", backgroundSize: "cover", backgroundPosition: "center", borderRadius: 10, padding: "14px 18px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{text}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 3 }}>{subText}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Order Now</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
          <div onClick={() => setBannerOn(!bannerOn)} style={{ width: 40, height: 22, borderRadius: 11, background: bannerOn ? "#25D366" : "#ccc", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: bannerOn ? 20 : 2, transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: bannerOn ? "#25D366" : "#888" }}>{bannerOn ? "Banner ON" : "Banner OFF"}</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Banner text</label>
          <input value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>Sub text</label>
          <input value={subText} onChange={e => setSubText(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Banner color</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["#E23744", "#f8c105", "#25D366", "#0D0D0D", "#2563EB", "#7C3AED"].map(c => (
              <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: "pointer", border: color === c ? "3px solid #0D0D0D" : "1px solid #e0e0e0" }} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 8 }}>Banner image (optional)</label>
          <label style={{ display: "block", border: "1px dashed #ccc", borderRadius: 8, padding: "1rem", textAlign: "center", cursor: "pointer", background: "#f9f9f9" }}>
            <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>📷</span>
            <span style={{ fontSize: 13, color: "#888" }}>Click to upload banner image</span>
            <input type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
          </label>
        </div>

        <button onClick={handleDeploy} style={{ width: "100%", background: "#E23744", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14 }}>
          💾 Save banner and deploy all sites
        </button>
      </div>
    </div>
  );
}
