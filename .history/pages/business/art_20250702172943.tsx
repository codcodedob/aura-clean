// pages/index.tsx

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import WalletPanel from "@/components/WalletPanel";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const GoogleMapReact = dynamic(() => import('google-map-react'), { ssr: false });

const DEFAULT_VIDEO = "/bg/default-art.mp4";

export default function ArtBusinessPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [famAwards, setFamAwards] = useState<any[]>([]);
  const [liveTickets, setLiveTickets] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<{ [k: string]: boolean }>({});
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>({});
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [fieldValue, setFieldValue] = useState<any>("");
  const [userFlow, setUserFlow] = useState<"business" | "arc">("arc");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [haloExists, setHaloExists] = useState<boolean>(false);

  const router = useRouter();

  const arcFields = [
    "halo_id", "birthday", "age", "sex", "address",
    "parent_a_halo", "parent_z_halo", "username",
    "display_image", "user_id", "shipping_address", "halo_range"
  ];

  const businessFields = [
    "account_created", "art_role", "portfolio", "wallet", "verification", "artgang"
  ];

  const currentFields = userFlow === "arc" ? arcFields : businessFields;
  const currentField = editingFieldIndex !== null ? currentFields[editingFieldIndex] : null;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (user) {
        setUser(user);
        let { data: udata } = await supabase.from("users").select("*").eq("id", user.id).single();
        const updates: any = {};

        if (!udata?.account_created) {
          updates.account_created = true;
        }
        if (!udata?.email && user.email) {
          updates.email = user.email;
        }
        if (!udata?.user_id) {
          updates.user_id = user.id;
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from("users").update(updates).eq("id", user.id);
          udata = { ...udata, ...updates };
        }

        setUserData(udata || {});
        setUserFlow(udata?.preferred_flow || "arc");

        const { data: halo } = await supabase.from("halo").select("halo_id").eq("user_id", user.id).single();
        if (halo?.halo_id) setHaloExists(true);

        const sharedFields = Object.fromEntries(
          arcFields.concat(businessFields).map(field => [field, udata?.[field]]).filter(([_, v]) => v)
        );
        await supabase.from("halo").upsert({ user_id: user.id, ...sharedFields }, { onConflict: "user_id" });
        await supabase.from("business").upsert({ user_id: user.id, ...sharedFields }, { onConflict: "user_id" });
      }
    };
    fetchUser();

    supabase.from("settings").select("value").eq("key", "videourl").single().then(({ data }) => setVideoUrl(data?.value || DEFAULT_VIDEO));
    supabase.from("fam_awards").select("*").order("year", { ascending: false }).then(({ data }) => setFamAwards(data || []));
    supabase.from("tickets").select("*").then(({ data }) => setLiveTickets(data || []));
  }, []);

  const calculateStatus = () => {
    const filledFields = currentFields.filter(f => userData[f]);
    if (filledFields.length === currentFields.length) return "active";
    if (filledFields.length > 0) return "in progress";
    return "onboarding";
  };

  const handleSubmitField = async () => {
    if (!user || editingFieldIndex === null) return;
    const field = currentFields[editingFieldIndex];
    const updated = { ...userData, [field]: fieldValue };
    const status = calculateStatus();
    const { error } = await supabase.from("users").update({ ...updated, status }).eq("id", user.id);
    if (!error) {
      setUserData(updated);
      await supabase.from("halo").upsert({ user_id: user.id, [field]: fieldValue }, { onConflict: "user_id" });
      await supabase.from("business").upsert({ user_id: user.id, [field]: fieldValue }, { onConflict: "user_id" });
      setFieldValue("");
      const nextIndex = editingFieldIndex + 1;
      if (nextIndex < currentFields.length) {
        setEditingFieldIndex(nextIndex);
        setFieldValue(updated[currentFields[nextIndex]] || "");
      } else {
        setEditingFieldIndex(null);
      }
      setSaveMessage("✅ Saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } else {
      setSaveMessage("❌ Save failed. Check console.");
      console.error("Save failed:", error);
    }
  };

  const handleGenerateHalo = async () => {
    if (!user) return;
    const newHaloId = `halo_${uuidv4()}`;
    const { error } = await supabase.from("users").update({ halo_id: newHaloId }).eq("id", user.id);
    if (!error) {
      setUserData(prev => ({ ...prev, halo_id: newHaloId }));
      await supabase.from("halo").upsert({ user_id: user.id, halo_id: newHaloId }, { onConflict: "user_id" });
      setHaloExists(true);
      setSaveMessage("🛸 Halo Arc generated!");
    } else {
      setSaveMessage("❌ Failed to generate Halo Arc");
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const progressPercentage = Math.floor((currentFields.filter(f => userData[f]).length / currentFields.length) * 100);
  const mapCenter = { lat: 40.748817, lng: -73.985428 };

  const renderInputByType = (field: string) => {
    if (field === "age") {
      return <input type="number" min={0} max={120} value={fieldValue} onChange={e => setFieldValue(e.target.value)} placeholder="Enter age" style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #444', width: '60%', marginRight: '1rem' }} />
    }
    if (field === "birthday") {
      return <input type="date" value={fieldValue} onChange={e => setFieldValue(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #444', width: '60%', marginRight: '1rem' }} />
    }
    return <input value={fieldValue} onChange={e => setFieldValue(e.target.value)} placeholder={`Enter ${field}`} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #444', width: '60%', marginRight: '1rem' }} />
  };

  return (
    <div style={{ minHeight: "100vh", color: "#fff", position: "relative", overflow: "hidden" }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginTop: "2rem" }}>Welcome to the {userFlow === "arc" ? "ArcSession" : "Business"} Onboarding</h1>
      <p style={{ textAlign: "center", color: "#aaa" }}>Progress: {progressPercentage}%</p>
      {!haloExists && userFlow === "arc" && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <button onClick={handleGenerateHalo} style={{ padding: "10px 16px", borderRadius: 8, background: "#39ff14", color: "#000", fontWeight: 700 }}>Generate Halo Arc</button>
        </div>
      )}
      {editingFieldIndex !== null && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          {renderInputByType(currentField!)}
          <button onClick={handleSubmitField} style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", borderRadius: 6, fontWeight: 700 }}>Save</button>
        </div>
      )}
      {saveMessage && <p style={{ textAlign: "center", color: "#39ff14", marginTop: "1rem" }}>{saveMessage}</p>}

      {/* Additional UI Sections */}
      <div style={{ padding: 24, background: "#111" }}>
        <WalletPanel />
      </div>

      <div style={{ padding: "2rem 1rem", display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 24, background: "rgba(19,32,24,0.85)", marginTop: 32 }}>
        {/* Left: Times Table */}
        <div>
          <div style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>Times Table</div>
            <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>View and manage availability</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10, border: "none", fontSize: 14 }}>Make Time</button>
              <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700, fontSize: 14 }}>Sync</button>
            </div>
          </div>
        </div>

        {/* Center: FAM Awards & Tickets */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 8 }}>FAM Awards</div>
            <div style={{ display: "flex", overflowX: "auto", gap: 12 }}>
              {(famAwards.length === 0 ? [{ id: 'demo', title: 'Demo Award', img_url: '/awards/artist1.jpg', winner: 'Demo' }] : famAwards).map(a => (
                <div key={a.id} style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160 }}>
                  <img src={a.img_url} style={{ width: "100%", borderRadius: 6 }} />
                  <div style={{ fontSize: 13, color: "#eee", marginTop: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>Winner: {a.winner}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 8 }}>Live Tickets</div>
            <div style={{ display: "flex", overflowX: "auto", gap: 12 }}>
              {liveTickets.map(t => (
                <div
                  key={t.id}
                  style={{ background: "#101314", padding: 10, borderRadius: 10, minWidth: 160, cursor: "pointer" }}
                  onClick={() => setShowQR(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                >
                  {showQR[t.id] ? (
                    <>
                      <QRCode value={t.id} size={100} bgColor="#000" fgColor="#39ff14" />
                      <div style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>Tap to hide QR</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.event}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{t.date} · {t.venue}</div>
                      <div style={{ fontSize: 11, color: "#fecf2f" }}>Seat: {t.seat}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: IdeaFlight */}
        <div>
          <div style={{ background: "#181f1b", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#39ff14", marginBottom: 6 }}>IdeaFlight</div>
            <p style={{ fontSize: 13, color: "#eee", marginBottom: 12 }}>Plan and launch new initiatives</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, background: "#1b2", color: "#fff", padding: "8px 0", fontWeight: 700, borderRadius: 10, border: "none", fontSize: 14 }}>Create</button>
              <button style={{ flex: 1, background: "transparent", color: "#39ff14", border: "2px solid #39ff14", borderRadius: 10, padding: "8px 0", fontWeight: 700, fontSize: 14 }}>Go to Space</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
